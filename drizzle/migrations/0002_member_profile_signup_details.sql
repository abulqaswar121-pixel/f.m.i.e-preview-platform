CREATE OR REPLACE FUNCTION public.create_member_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 INSERT INTO public.profiles(id, display_name, organization, job_title, country, industry, preferences)
 VALUES (
  NEW.id,
  left(coalesce(nullif(NEW.raw_user_meta_data->>'name', ''), nullif(NEW.raw_user_meta_data->>'full_name', ''), ''), 120),
  left(coalesce(NEW.raw_user_meta_data->>'organization', ''), 160),
  left(coalesce(NEW.raw_user_meta_data->>'jobTitle', ''), 120),
  left(coalesce(NEW.raw_user_meta_data->>'country', ''), 80),
  left(coalesce(NEW.raw_user_meta_data->>'industry', ''), 80),
  CASE WHEN jsonb_typeof(NEW.raw_user_meta_data->'preferences') = 'object' THEN NEW.raw_user_meta_data->'preferences' ELSE '{}'::jsonb END
 )
 ON CONFLICT (id) DO NOTHING;
 INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'registered_user') ON CONFLICT (user_id, role) DO NOTHING;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.create_member_profile() FROM PUBLIC;