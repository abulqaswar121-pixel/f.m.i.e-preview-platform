import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface TeamMember {
  userId: string;
  email: string;
  name: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

async function assertSuperAdmin(context: {
  supabase: { rpc: (fn: "is_super_admin", args: { _user_id: string }) => PromiseLike<{ data: boolean | null }> };
  userId: string;
}): Promise<void> {
  const { data } = await context.supabase.rpc("is_super_admin", { _user_id: context.userId });
  if (!data) throw new Error("Only the super admin can manage admin access.");
}

async function loadTeam(): Promise<TeamMember[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [{ data: roles }, { data: supers }, { data: profiles }] = await Promise.all([
    supabaseAdmin.from("user_roles").select("user_id").eq("role", "administrator"),
    supabaseAdmin.from("super_admins").select("user_id"),
    supabaseAdmin.from("profiles").select("id, display_name"),
  ]);
  const adminIds = new Set((roles ?? []).map((row) => row.user_id));
  const superIds = new Set((supers ?? []).map((row) => row.user_id));
  const names = new Map((profiles ?? []).map((row) => [row.id, row.display_name]));
  const team: TeamMember[] = [];
  for (const id of new Set([...adminIds, ...superIds])) {
    const { data } = await supabaseAdmin.auth.admin.getUserById(id);
    team.push({
      userId: id,
      email: data.user?.email ?? "",
      name: names.get(id) ?? "",
      isAdmin: adminIds.has(id),
      isSuperAdmin: superIds.has(id),
    });
  }
  return team.sort((a, b) => Number(b.isSuperAdmin) - Number(a.isSuperAdmin) || a.email.localeCompare(b.email));
}

export const listAdminTeam = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context);
    return loadTeam();
  });

export const grantAdminAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { email: string }) => {
    const email = String(input.email ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new Error("Enter a valid email address.");
    return { email };
  })
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let found: string | null = null;
    for (let page = 1; page <= 20 && !found; page += 1) {
      const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw new Error("Could not look up members right now.");
      found = list.users.find((user) => user.email?.toLowerCase() === data.email)?.id ?? null;
      if (list.users.length < 200) break;
    }
    if (!found) throw new Error("No account uses that email yet. Ask them to sign up first.");
    const { data: existing } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", found)
      .eq("role", "administrator")
      .maybeSingle();
    if (!existing) {
      const { error } = await supabaseAdmin.from("user_roles").insert({ user_id: found, role: "administrator" });
      if (error) throw new Error("Could not give admin access.");
    }
    return loadTeam();
  });

export const revokeAdminAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string }) => ({ userId: String(input.userId ?? "") }))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: isSuper } = await supabaseAdmin
      .from("super_admins")
      .select("user_id")
      .eq("user_id", data.userId)
      .maybeSingle();
    if (isSuper) throw new Error("The super admin's access cannot be removed here.");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", data.userId)
      .eq("role", "administrator");
    if (error) throw new Error("Could not remove admin access.");
    return loadTeam();
  });
