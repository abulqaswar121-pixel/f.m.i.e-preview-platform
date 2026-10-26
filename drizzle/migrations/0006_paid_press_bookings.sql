ALTER TABLE public.press_releases
  ADD COLUMN IF NOT EXISTS price_usd_cents bigint CHECK (price_usd_cents >= 0),
  ADD COLUMN IF NOT EXISTS provider_transaction_id text UNIQUE;

CREATE INDEX IF NOT EXISTS press_releases_user_created ON public.press_releases(user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.settle_press_release_payment(
  _reference text,
  _amount_minor bigint,
  _currency text,
  _provider_transaction_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.press_releases%ROWTYPE;
BEGIN
  SELECT * INTO v_row FROM public.press_releases WHERE payment_reference = _reference FOR UPDATE;
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  IF v_row.quote_minor IS NULL OR v_row.quote_minor <> _amount_minor OR v_row.currency <> _currency THEN
    RETURN false;
  END IF;
  IF v_row.paid_at IS NOT NULL THEN
    RETURN true;
  END IF;
  IF v_row.status <> 'awaiting_payment' OR _provider_transaction_id IS NULL OR length(_provider_transaction_id) = 0 THEN
    RETURN false;
  END IF;
  UPDATE public.press_releases
    SET status = 'submitted',
        paid_at = now(),
        provider_transaction_id = _provider_transaction_id,
        timeline = timeline || jsonb_build_array(jsonb_build_object('status', 'submitted', 'at', now(), 'note', 'Payment confirmed by Paystack. Sent to the press desk.'))
    WHERE id = v_row.id;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.settle_press_release_payment(text, bigint, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.settle_press_release_payment(text, bigint, text, text) TO service_role;

CREATE OR REPLACE FUNCTION public.update_press_release_stage(
  _id uuid,
  _status text,
  _note text,
  _published_url text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.press_releases%ROWTYPE;
BEGIN
  IF _status NOT IN ('under_review','additional_info_required','approved','in_production','distribution_in_progress','completed','rejected') THEN
    RAISE EXCEPTION 'Stage not allowed';
  END IF;
  SELECT * INTO v_row FROM public.press_releases WHERE id = _id FOR UPDATE;
  IF NOT FOUND OR v_row.paid_at IS NULL THEN
    RETURN false;
  END IF;
  UPDATE public.press_releases
    SET status = _status,
        published_urls = CASE
          WHEN coalesce(trim(_published_url), '') = '' THEN published_urls
          ELSE published_urls || jsonb_build_array(trim(_published_url))
        END,
        timeline = timeline || jsonb_build_array(jsonb_build_object('status', _status, 'at', now(), 'note', left(coalesce(_note, ''), 1000)))
    WHERE id = _id;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.update_press_release_stage(uuid, text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_press_release_stage(uuid, text, text, text) TO service_role;