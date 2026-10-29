import { useEffect, useState } from "react";
import { Crown, Loader2, ShieldCheck, UserMinus, UserPlus } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  grantAdminAccess,
  listAdminTeam,
  revokeAdminAccess,
  type TeamMember,
} from "@/lib/admin-team.functions";

/** Super admin only: see every admin, give admin access by email, or take it away. */
export function AdminTeamPanel() {
  const list = useServerFn(listAdminTeam);
  const grant = useServerFn(grantAdminAccess);
  const revoke = useServerFn(revokeAdminAccess);
  const [team, setTeam] = useState<TeamMember[] | null>(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    list()
      .then(setTeam)
      .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Could not load the team."));
  }, [list]);

  async function add() {
    setBusy(true);
    try {
      setTeam(await grant({ data: { email } }));
      setEmail("");
      toast.success("Admin access given.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not give access.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(member: TeamMember) {
    if (!window.confirm(`Remove admin access from ${member.email}?`)) return;
    setBusy(true);
    try {
      setTeam(await revoke({ data: { userId: member.userId } }));
      toast.success("Admin access removed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove access.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4 rounded-lg border border-brand-border bg-white p-5">
      <div>
        <h2 className="font-display text-xl font-semibold text-brand-charcoal">Admin team</h2>
        <p className="mt-1 max-w-2xl text-xs text-brand-slate">
          Only the super admin sees this page. Type the email of someone who already has an
          account to make them an admin. Admins can run the control room but cannot add or
          remove other admins.
        </p>
      </div>
      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          void add();
        }}
      >
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Member's email"
          className="w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm sm:max-w-sm"
        />
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <UserPlus className="mr-1 h-4 w-4" />}
          Make admin
        </Button>
      </form>
      {team === null ? (
        <p className="text-xs text-brand-slate">Loading…</p>
      ) : (
        <ul className="divide-y divide-brand-border rounded-md border border-brand-border">
          {team.map((member) => (
            <li key={member.userId} className="flex flex-wrap items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-brand-charcoal">{member.name || member.email}</p>
                <p className="truncate text-xs text-brand-slate">{member.email}</p>
              </div>
              {member.isSuperAdmin ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-gold">
                  <Crown className="h-4 w-4" /> Super admin
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs text-brand-slate">
                    <ShieldCheck className="h-4 w-4" /> Admin
                  </span>
                  <Button size="sm" variant="outline" disabled={busy} onClick={() => void remove(member)}>
                    <UserMinus className="mr-1 h-3 w-3" /> Remove
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
