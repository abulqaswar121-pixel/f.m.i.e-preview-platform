import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

/** True when the signed-in account is the super admin (reads only its own saved row). */
export function useSuperAdmin(): boolean {
  const { user } = useAuth();
  const [isSuper, setIsSuper] = useState(false);
  useEffect(() => {
    let cancelled = false;
    void supabase.auth.getUser().then(async ({ data }) => {
      const id = data.user?.id;
      if (!id) return setIsSuper(false);
      const { data: row } = await supabase.from("super_admins").select("user_id").eq("user_id", id).maybeSingle();
      if (!cancelled) setIsSuper(Boolean(row));
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);
  return isSuper;
}
