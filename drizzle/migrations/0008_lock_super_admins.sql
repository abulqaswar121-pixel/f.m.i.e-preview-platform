REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.super_admins FROM authenticated, anon;
REVOKE ALL ON public.super_admins FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM anon;