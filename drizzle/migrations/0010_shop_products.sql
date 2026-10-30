CREATE TABLE public.shop_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Football',
  description text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '[]'::jsonb,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.shop_products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shop_products TO authenticated;
GRANT ALL ON public.shop_products TO service_role;
ALTER TABLE public.shop_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY products_read ON public.shop_products FOR SELECT TO anon, authenticated USING (active OR public.has_role(auth.uid(), 'administrator'));
CREATE POLICY products_admin_insert ON public.shop_products FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'administrator'));
CREATE POLICY products_admin_update ON public.shop_products FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'administrator')) WITH CHECK (public.has_role(auth.uid(), 'administrator'));
CREATE POLICY products_admin_delete ON public.shop_products FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'administrator'));