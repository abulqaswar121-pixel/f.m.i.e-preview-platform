ALTER TABLE public.surveys
  ADD COLUMN IF NOT EXISTS target_life_stages jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS response_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS creator_name text NOT NULL DEFAULT '';

CREATE UNIQUE INDEX IF NOT EXISTS survey_answers_one_per_member ON public.survey_answers(survey_id, respondent_id);

CREATE POLICY answers_creator ON public.survey_answers FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.surveys s WHERE s.id = survey_id AND s.creator_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.refund_survey_escrow(_survey_id uuid)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_survey public.surveys%ROWTYPE;
BEGIN
  SELECT * INTO v_survey FROM public.surveys WHERE id = _survey_id FOR UPDATE;
  IF NOT FOUND OR v_survey.escrow_points <= 0 THEN RETURN 0; END IF;
  UPDATE public.wallet_accounts
    SET points = points + v_survey.escrow_points,
        locked_points = GREATEST(0, locked_points - v_survey.escrow_points), updated_at = now()
    WHERE user_id = v_survey.creator_id;
  UPDATE public.surveys SET escrow_points = 0, updated_at = now() WHERE id = _survey_id;
  INSERT INTO public.wallet_transactions(user_id, event_key, kind, amount_minor, points, currency, note)
    VALUES (v_survey.creator_id, 'survey:refund:' || _survey_id::text || ':' || extract(epoch from clock_timestamp())::text,
            'escrow_refund', 0, v_survey.escrow_points, 'NGN', 'Unused points returned for "' || v_survey.title || '"');
  RETURN v_survey.escrow_points;
END; $$;

CREATE OR REPLACE FUNCTION public.submit_cloud_survey(
  _creator uuid, _creator_name text, _title text, _category text, _objective text, _audience text,
  _target jsonb, _questions jsonb, _tags jsonb, _consent text, _anonymous boolean,
  _opening timestamptz, _closing timestamptz, _reward_points bigint, _reward_minor bigint, _response_limit integer)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_need bigint; v_points bigint; v_id uuid := gen_random_uuid();
BEGIN
  IF _reward_points < 1 OR _response_limit < 1 OR _reward_minor < 0 THEN RAISE EXCEPTION 'Invalid reward settings'; END IF;
  IF jsonb_typeof(_questions) <> 'array' OR jsonb_array_length(_questions) = 0 THEN RAISE EXCEPTION 'Add at least one question'; END IF;
  v_need := _reward_points * _response_limit;
  INSERT INTO public.wallet_accounts(user_id) VALUES (_creator) ON CONFLICT (user_id) DO NOTHING;
  SELECT points INTO v_points FROM public.wallet_accounts WHERE user_id = _creator FOR UPDATE;
  IF v_points < v_need THEN RAISE EXCEPTION 'Not enough points'; END IF;
  UPDATE public.wallet_accounts SET points = points - v_need, locked_points = locked_points + v_need, updated_at = now() WHERE user_id = _creator;
  INSERT INTO public.surveys(id, creator_id, creator_name, title, category, objective, audience, target_life_stages, questions, tags,
    consent_notice, is_anonymous, opening_date, closing_date, reward_points, reward_minor, response_limit, escrow_points, status)
  VALUES (v_id, _creator, _creator_name, _title, _category, _objective, _audience, COALESCE(_target, '[]'::jsonb), _questions, COALESCE(_tags, '[]'::jsonb),
    _consent, _anonymous, _opening, _closing, _reward_points, _reward_minor, _response_limit, v_need, 'pending_moderation');
  INSERT INTO public.wallet_transactions(user_id, event_key, kind, amount_minor, points, currency, note)
    VALUES (_creator, 'survey:lock:' || v_id::text, 'escrow_lock', 0, -v_need, 'NGN', 'Points held to pay answers for "' || _title || '"');
  RETURN v_id;
END; $$;

CREATE OR REPLACE FUNCTION public.moderate_cloud_survey(_survey_id uuid, _decision text, _note text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_status text;
BEGIN
  SELECT status INTO v_status FROM public.surveys WHERE id = _survey_id FOR UPDATE;
  IF NOT FOUND OR v_status <> 'pending_moderation' THEN RETURN false; END IF;
  IF _decision = 'approve' THEN
    UPDATE public.surveys SET status = 'active', moderation_note = COALESCE(_note, ''), updated_at = now() WHERE id = _survey_id;
  ELSIF _decision = 'reject' THEN
    PERFORM public.refund_survey_escrow(_survey_id);
    UPDATE public.surveys SET status = 'draft', moderation_note = COALESCE(_note, ''), updated_at = now() WHERE id = _survey_id;
  ELSE RAISE EXCEPTION 'Decision must be approve or reject'; END IF;
  RETURN true;
END; $$;

CREATE OR REPLACE FUNCTION public.close_cloud_survey(_survey_id uuid, _actor uuid, _is_admin boolean)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_survey public.surveys%ROWTYPE;
BEGIN
  SELECT * INTO v_survey FROM public.surveys WHERE id = _survey_id FOR UPDATE;
  IF NOT FOUND OR v_survey.status <> 'active' THEN RETURN false; END IF;
  IF v_survey.creator_id <> _actor AND NOT _is_admin THEN RETURN false; END IF;
  UPDATE public.surveys SET status = 'closed', updated_at = now() WHERE id = _survey_id;
  PERFORM public.refund_survey_escrow(_survey_id);
  RETURN true;
END; $$;

CREATE OR REPLACE FUNCTION public.settle_survey_answer(
  _survey_id uuid, _respondent uuid, _answers jsonb, _duration integer, _segment text, _country text)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_survey public.surveys%ROWTYPE; v_answer uuid := gen_random_uuid();
BEGIN
  SELECT * INTO v_survey FROM public.surveys WHERE id = _survey_id FOR UPDATE;
  IF NOT FOUND OR v_survey.status <> 'active' OR v_survey.hidden THEN RAISE EXCEPTION 'Survey is not open'; END IF;
  IF v_survey.creator_id = _respondent THEN RAISE EXCEPTION 'You cannot answer your own survey'; END IF;
  IF v_survey.escrow_points < v_survey.reward_points THEN RAISE EXCEPTION 'Survey is not open'; END IF;
  IF EXISTS (SELECT 1 FROM public.survey_answers WHERE survey_id = _survey_id AND respondent_id = _respondent) THEN
    RAISE EXCEPTION 'You have already answered this survey';
  END IF;
  INSERT INTO public.survey_answers(id, survey_id, respondent_id, answers, completed, duration_seconds, respondent_segment, respondent_country)
    VALUES (v_answer, _survey_id, _respondent, COALESCE(_answers, '{}'::jsonb), true, GREATEST(0, _duration),
      CASE WHEN v_survey.is_anonymous THEN 'Anonymous respondent' ELSE COALESCE(_segment, '') END,
      CASE WHEN v_survey.is_anonymous THEN 'Not recorded' ELSE COALESCE(_country, '') END);
  UPDATE public.wallet_accounts SET locked_points = GREATEST(0, locked_points - v_survey.reward_points), updated_at = now() WHERE user_id = v_survey.creator_id;
  INSERT INTO public.wallet_accounts(user_id) VALUES (_respondent) ON CONFLICT (user_id) DO NOTHING;
  UPDATE public.wallet_accounts SET cash_minor = cash_minor + v_survey.reward_minor, updated_at = now() WHERE user_id = _respondent;
  INSERT INTO public.wallet_transactions(user_id, event_key, kind, amount_minor, points, currency, note)
    VALUES (_respondent, 'survey:reward:' || v_answer::text, 'survey_reward', v_survey.reward_minor, 0, 'NGN', 'Reward for answering "' || v_survey.title || '"');
  UPDATE public.surveys SET escrow_points = escrow_points - reward_points, response_count = response_count + 1, updated_at = now() WHERE id = _survey_id;
  IF v_survey.response_count + 1 >= v_survey.response_limit OR v_survey.escrow_points - v_survey.reward_points < v_survey.reward_points THEN
    UPDATE public.surveys SET status = 'closed' WHERE id = _survey_id;
    PERFORM public.refund_survey_escrow(_survey_id);
  END IF;
  RETURN v_survey.reward_minor;
END; $$;

REVOKE ALL ON FUNCTION public.refund_survey_escrow(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.submit_cloud_survey(uuid, text, text, text, text, text, jsonb, jsonb, jsonb, text, boolean, timestamptz, timestamptz, bigint, bigint, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.moderate_cloud_survey(uuid, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.close_cloud_survey(uuid, uuid, boolean) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.settle_survey_answer(uuid, uuid, jsonb, integer, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refund_survey_escrow(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.submit_cloud_survey(uuid, text, text, text, text, text, jsonb, jsonb, jsonb, text, boolean, timestamptz, timestamptz, bigint, bigint, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.moderate_cloud_survey(uuid, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.close_cloud_survey(uuid, uuid, boolean) TO service_role;
GRANT EXECUTE ON FUNCTION public.settle_survey_answer(uuid, uuid, jsonb, integer, text, text) TO service_role;