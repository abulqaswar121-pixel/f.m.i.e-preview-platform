CREATE TABLE public.super_admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.super_admins TO authenticated;
GRANT ALL ON public.super_admins TO service_role;
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY super_read_own ON public.super_admins FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.super_admins WHERE user_id = _user_id)
$$;

CREATE TABLE public.site_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Finance',
  content text NOT NULL DEFAULT '',
  cover_url text NOT NULL DEFAULT '',
  author_name text NOT NULL DEFAULT 'F.M.I.E Newsroom',
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_featured boolean NOT NULL DEFAULT false,
  newsletter boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  published_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_articles TO authenticated;
GRANT ALL ON public.site_articles TO service_role;
ALTER TABLE public.site_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY articles_public_read ON public.site_articles FOR SELECT TO anon, authenticated USING (published OR public.has_role(auth.uid(), 'administrator'));
CREATE POLICY articles_admin_insert ON public.site_articles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'administrator'));
CREATE POLICY articles_admin_update ON public.site_articles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'administrator')) WITH CHECK (public.has_role(auth.uid(), 'administrator'));
CREATE POLICY articles_admin_delete ON public.site_articles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'administrator'));
CREATE TRIGGER site_articles_touch BEFORE UPDATE ON public.site_articles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.site_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  video_url text NOT NULL,
  storage_path text,
  active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_videos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_videos TO authenticated;
GRANT ALL ON public.site_videos TO service_role;
ALTER TABLE public.site_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY videos_public_read ON public.site_videos FOR SELECT TO anon, authenticated USING (active OR public.has_role(auth.uid(), 'administrator'));
CREATE POLICY videos_admin_insert ON public.site_videos FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'administrator'));
CREATE POLICY videos_admin_update ON public.site_videos FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'administrator')) WITH CHECK (public.has_role(auth.uid(), 'administrator'));
CREATE POLICY videos_admin_delete ON public.site_videos FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'administrator'));

CREATE POLICY site_media_public_read ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'site-media');
CREATE POLICY site_media_admin_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-media' AND public.has_role(auth.uid(), 'administrator'));
CREATE POLICY site_media_admin_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'site-media' AND public.has_role(auth.uid(), 'administrator'));