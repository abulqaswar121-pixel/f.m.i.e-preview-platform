CREATE TYPE public.app_role AS ENUM ('registered_user', 'earner', 'survey_creator', 'premium_customer', 'corporate_account', 'contributor', 'administrator');
CREATE TABLE public.profiles (
 id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 display_name text NOT NULL DEFAULT '', avatar_path text, organization text NOT NULL DEFAULT '', job_title text NOT NULL DEFAULT '', country text NOT NULL DEFAULT '', industry text NOT NULL DEFAULT '',
 preferences jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (display_name, avatar_path, organization, job_title, country, industry, preferences) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_read_own ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE TABLE public.user_roles (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, role public.app_role NOT NULL DEFAULT 'registered_user', UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY roles_read_own ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
 SELECT _user_id = auth.uid() AND EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
CREATE FUNCTION public.create_member_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 INSERT INTO public.profiles(id, display_name, organization, job_title, country, industry) VALUES (NEW.id, coalesce(NEW.raw_user_meta_data->>'name', ''), coalesce(NEW.raw_user_meta_data->>'organization', ''), coalesce(NEW.raw_user_meta_data->>'jobTitle', ''), coalesce(NEW.raw_user_meta_data->>'country', ''), coalesce(NEW.raw_user_meta_data->>'industry', ''));
 INSERT INTO public.user_roles(user_id, role) VALUES(NEW.id, 'registered_user');
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.create_member_profile() FROM PUBLIC;
CREATE TRIGGER fmie_member_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_member_profile();
CREATE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.surveys (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), creator_id uuid NOT NULL DEFAULT auth.uid(), title text NOT NULL, slug text UNIQUE, category text NOT NULL DEFAULT '', objective text NOT NULL DEFAULT '', audience text NOT NULL DEFAULT '',
 tier text NOT NULL DEFAULT 'free' CHECK(tier IN ('free','premium','corporate')), status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','pending_moderation','active','closed')), hidden boolean NOT NULL DEFAULT false,
 questions jsonb NOT NULL DEFAULT '[]'::jsonb, tags jsonb NOT NULL DEFAULT '[]'::jsonb, consent_notice text NOT NULL DEFAULT '', is_anonymous boolean NOT NULL DEFAULT true, is_branded boolean NOT NULL DEFAULT false,
 opening_date timestamptz, closing_date timestamptz, response_limit integer NOT NULL DEFAULT 0 CHECK(response_limit >= 0), reward_minor bigint NOT NULL DEFAULT 0 CHECK(reward_minor >= 0), reward_points bigint NOT NULL DEFAULT 0 CHECK(reward_points >= 0), escrow_points bigint NOT NULL DEFAULT 0 CHECK(escrow_points >= 0), moderation_note text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.surveys TO anon, authenticated;
GRANT INSERT (creator_id,title,slug,category,objective,audience,questions,tags,consent_notice,is_anonymous,opening_date,closing_date) ON public.surveys TO authenticated;
GRANT UPDATE (title,slug,category,objective,audience,questions,tags,consent_notice,is_anonymous,opening_date,closing_date) ON public.surveys TO authenticated;
GRANT ALL ON public.surveys TO service_role;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
CREATE POLICY surveys_public ON public.surveys FOR SELECT TO anon, authenticated USING (status = 'active' AND NOT hidden);
CREATE POLICY surveys_owner ON public.surveys FOR SELECT TO authenticated USING (creator_id = auth.uid());
CREATE POLICY surveys_admin ON public.surveys FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'administrator'));
CREATE POLICY surveys_create_draft ON public.surveys FOR INSERT TO authenticated WITH CHECK(creator_id = auth.uid() AND status = 'draft' AND tier = 'free' AND reward_minor = 0 AND reward_points = 0 AND escrow_points = 0);
CREATE POLICY surveys_edit_draft ON public.surveys FOR UPDATE TO authenticated USING(creator_id = auth.uid() AND status = 'draft') WITH CHECK(creator_id = auth.uid() AND status = 'draft');
CREATE TRIGGER surveys_updated BEFORE UPDATE ON public.surveys FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX surveys_creator_idx ON public.surveys(creator_id);
CREATE TABLE public.survey_answers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), survey_id uuid NOT NULL REFERENCES public.surveys(id), respondent_id uuid NOT NULL, answers jsonb NOT NULL DEFAULT '{}'::jsonb, completed boolean NOT NULL DEFAULT false, duration_seconds integer NOT NULL DEFAULT 0 CHECK(duration_seconds >= 0), respondent_segment text NOT NULL DEFAULT '', respondent_country text NOT NULL DEFAULT '', submitted_at timestamptz NOT NULL DEFAULT now(), UNIQUE(survey_id,respondent_id)
);
GRANT SELECT ON public.survey_answers TO authenticated;
GRANT ALL ON public.survey_answers TO service_role;
ALTER TABLE public.survey_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY answers_own ON public.survey_answers FOR SELECT TO authenticated USING(respondent_id = auth.uid());
CREATE POLICY answers_admin ON public.survey_answers FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'administrator'));
COMMENT ON TABLE public.survey_answers IS 'Writes and creator-facing anonymous aggregates must use validated server operations; raw respondent identities are not exposed to creators.';

CREATE TABLE public.wallet_accounts (
 user_id uuid PRIMARY KEY, currency text NOT NULL DEFAULT 'NGN' CHECK(currency = 'NGN'), cash_minor bigint NOT NULL DEFAULT 0 CHECK(cash_minor >= 0), points bigint NOT NULL DEFAULT 0 CHECK(points >= 0), locked_points bigint NOT NULL DEFAULT 0 CHECK(locked_points >= 0), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.wallet_accounts TO authenticated;
GRANT ALL ON public.wallet_accounts TO service_role;
ALTER TABLE public.wallet_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY wallet_read_own ON public.wallet_accounts FOR SELECT TO authenticated USING(user_id = auth.uid());
CREATE POLICY wallet_read_admin ON public.wallet_accounts FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'administrator'));
CREATE TABLE public.wallet_transactions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, event_key text NOT NULL UNIQUE, kind text NOT NULL CHECK(kind IN ('survey_reward','withdrawal','points_purchase','escrow_lock','escrow_refund')), amount_minor bigint NOT NULL DEFAULT 0, points bigint NOT NULL DEFAULT 0, currency text NOT NULL DEFAULT 'NGN' CHECK(currency='NGN'), note text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.wallet_transactions TO authenticated;
GRANT ALL ON public.wallet_transactions TO service_role;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY transactions_read_own ON public.wallet_transactions FOR SELECT TO authenticated USING(user_id = auth.uid());
CREATE POLICY transactions_read_admin ON public.wallet_transactions FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'administrator'));
CREATE INDEX wallet_transactions_user_idx ON public.wallet_transactions(user_id,created_at);
CREATE TABLE public.withdrawals (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, amount_minor bigint NOT NULL CHECK(amount_minor > 0), currency text NOT NULL DEFAULT 'NGN' CHECK(currency='NGN'), bank_code text NOT NULL, account_number text NOT NULL, account_name text NOT NULL, status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','processing','paid','rejected','failed')), provider_reference text UNIQUE, requested_at timestamptz NOT NULL DEFAULT now(), processed_at timestamptz
);
GRANT SELECT ON public.withdrawals TO authenticated;
GRANT ALL ON public.withdrawals TO service_role;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
CREATE POLICY withdrawals_read_own ON public.withdrawals FOR SELECT TO authenticated USING(user_id = auth.uid());
CREATE POLICY withdrawals_read_admin ON public.withdrawals FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'administrator'));
COMMENT ON TABLE public.wallet_accounts IS 'Amounts are integer minor currency units. Clients cannot change money or points; server settlement must be atomic and idempotent.';

CREATE TABLE public.press_releases (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL DEFAULT auth.uid(), reference_number text NOT NULL UNIQUE DEFAULT ('PR-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,16))), title text NOT NULL DEFAULT '', content_draft text NOT NULL DEFAULT '', company_name text NOT NULL DEFAULT '', contact_name text NOT NULL DEFAULT '', contact_email text NOT NULL DEFAULT '', contact_phone text NOT NULL DEFAULT '', country text NOT NULL DEFAULT '', industry text NOT NULL DEFAULT '', website_url text NOT NULL DEFAULT '', target_audience text NOT NULL DEFAULT '', selected_outlets jsonb NOT NULL DEFAULT '[]'::jsonb, distribution_regions jsonb NOT NULL DEFAULT '[]'::jsonb, attachments jsonb NOT NULL DEFAULT '[]'::jsonb, target_date date, disclosure_acknowledged boolean NOT NULL DEFAULT false, consent_to_processing boolean NOT NULL DEFAULT false,
 status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','submitted','under_review','additional_info_required','quote_sent','awaiting_payment','approved','in_production','distribution_in_progress','completed','rejected','cancelled')), quote_minor bigint CHECK(quote_minor >= 0), currency text NOT NULL DEFAULT 'NGN' CHECK(currency IN ('NGN','USD','GBP')), payment_reference text UNIQUE, paid_at timestamptz, published_urls jsonb NOT NULL DEFAULT '[]'::jsonb, timeline jsonb NOT NULL DEFAULT '[]'::jsonb, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.press_releases TO authenticated;
GRANT INSERT (user_id,title,content_draft,company_name,contact_name,contact_email,contact_phone,country,industry,website_url,target_audience,selected_outlets,distribution_regions,attachments,target_date,disclosure_acknowledged,consent_to_processing) ON public.press_releases TO authenticated;
GRANT UPDATE (title,content_draft,company_name,contact_name,contact_email,contact_phone,country,industry,website_url,target_audience,selected_outlets,distribution_regions,attachments,target_date,disclosure_acknowledged,consent_to_processing) ON public.press_releases TO authenticated;
GRANT ALL ON public.press_releases TO service_role;
ALTER TABLE public.press_releases ENABLE ROW LEVEL SECURITY;
CREATE POLICY press_read_own ON public.press_releases FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE POLICY press_read_admin ON public.press_releases FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'administrator'));
CREATE POLICY press_create_draft ON public.press_releases FOR INSERT TO authenticated WITH CHECK(user_id=auth.uid() AND status='draft' AND paid_at IS NULL AND quote_minor IS NULL AND payment_reference IS NULL);
CREATE POLICY press_edit_draft ON public.press_releases FOR UPDATE TO authenticated USING(user_id=auth.uid() AND status='draft') WITH CHECK(user_id=auth.uid() AND status='draft');
CREATE TRIGGER press_updated BEFORE UPDATE ON public.press_releases FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
COMMENT ON TABLE public.press_releases IS 'Drafting and AI polish precede payment. Payment and submission transitions must be verified server-side.';
CREATE TABLE public.kit_quotes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL DEFAULT auth.uid(), club_name text NOT NULL, sport text NOT NULL DEFAULT 'Football' CHECK(sport IN ('Football','Basketball','Corporate')), crest_path text, primary_color text NOT NULL DEFAULT '', secondary_color text NOT NULL DEFAULT '', roster jsonb NOT NULL DEFAULT '[]'::jsonb, quantity integer NOT NULL CHECK(quantity>0), delivery_date date, delivery_address text NOT NULL DEFAULT '', notes text NOT NULL DEFAULT '', status text NOT NULL DEFAULT 'requested' CHECK(status IN ('requested','quoted','accepted','closed')), quote_minor bigint CHECK(quote_minor>=0), quote_note text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.kit_quotes TO authenticated;
GRANT INSERT (user_id,club_name,sport,crest_path,primary_color,secondary_color,roster,quantity,delivery_date,delivery_address,notes) ON public.kit_quotes TO authenticated;
GRANT ALL ON public.kit_quotes TO service_role;
ALTER TABLE public.kit_quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY kits_read_own ON public.kit_quotes FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE POLICY kits_read_admin ON public.kit_quotes FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'administrator'));
CREATE POLICY kits_create_own ON public.kit_quotes FOR INSERT TO authenticated WITH CHECK(user_id=auth.uid() AND status='requested' AND quote_minor IS NULL);
CREATE TABLE public.shop_orders (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, reference text NOT NULL UNIQUE, email text NOT NULL, items jsonb NOT NULL DEFAULT '[]'::jsonb, address jsonb NOT NULL DEFAULT '{}'::jsonb, subtotal_minor bigint NOT NULL DEFAULT 0 CHECK(subtotal_minor>=0), discount_minor bigint NOT NULL DEFAULT 0 CHECK(discount_minor>=0), shipping_minor bigint NOT NULL DEFAULT 0 CHECK(shipping_minor>=0), total_minor bigint NOT NULL DEFAULT 0 CHECK(total_minor>=0), currency text NOT NULL DEFAULT 'GBP' CHECK(currency IN ('GBP','NGN','USD')), status text NOT NULL DEFAULT 'pending_payment' CHECK(status IN ('pending_payment','paid','in_fulfilment','shipped','delivered','cancelled','refunded')), payment_reference text UNIQUE, placed_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.shop_orders TO authenticated;
GRANT ALL ON public.shop_orders TO service_role;
ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY orders_read_own ON public.shop_orders FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE POLICY orders_read_admin ON public.shop_orders FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'administrator'));
COMMENT ON TABLE public.shop_orders IS 'Server checkout must calculate totals from trusted product prices; client totals and paid status are never trusted.';

CREATE POLICY member_files_read_own ON storage.objects FOR SELECT TO authenticated USING(bucket_id='member-files' AND (storage.foldername(name))[1]=auth.uid()::text);
CREATE POLICY member_files_insert_own ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id='member-files' AND (storage.foldername(name))[1]=auth.uid()::text);
CREATE POLICY member_files_delete_own ON storage.objects FOR DELETE TO authenticated USING(bucket_id='member-files' AND (storage.foldername(name))[1]=auth.uid()::text);
CREATE POLICY member_files_read_admin ON storage.objects FOR SELECT TO authenticated USING(bucket_id='member-files' AND public.has_role(auth.uid(),'administrator'));
