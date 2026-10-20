import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";

import { AuthContext, type AuthContextValue, type ProfilePatch } from "@/hooks/useAuth";
import { roleDescriptions, roleLabels } from "@/config/site";
import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";
import { primaryRole } from "@/lib/roles";
import { api, useDatabase } from "@/services/api";
import type { NotificationPreferences, User, UserRole } from "@/types";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

interface MemberAccount {
  authId: string;
  email: string;
  name: string;
  organization: string;
  jobTitle: string;
  country: string;
  industry: string;
  preferences: Record<string, unknown>;
  role: UserRole;
  joinedAt: string;
}

const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  editorialDigest: true,
  surveyActivity: true,
  pressReleaseUpdates: true,
  orderAndInvoice: true,
  commercialOffers: false,
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function readNotifications(preferences: Record<string, unknown>): NotificationPreferences {
  const saved = asRecord(preferences["notifications"]);
  const flag = (key: keyof NotificationPreferences) =>
    typeof saved[key] === "boolean" ? (saved[key] as boolean) : DEFAULT_NOTIFICATIONS[key];
  return {
    editorialDigest: flag("editorialDigest"),
    surveyActivity: flag("surveyActivity"),
    pressReleaseUpdates: flag("pressReleaseUpdates"),
    orderAndInvoice: flag("orderAndInvoice"),
    commercialOffers: flag("commercialOffers"),
  };
}

function fallbackName(session: Session): string {
  const meta = asRecord(session.user.user_metadata);
  for (const key of ["name", "full_name"]) {
    const value = meta[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  const local = (session.user.email ?? "member").split("@")[0] ?? "member";
  return local
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** Reads the member's saved profile and roles. Falls back to a basic member if either read fails. */
async function fetchAccount(session: Session): Promise<MemberAccount> {
  const authId = session.user.id;
  const [profileResult, rolesResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, organization, job_title, country, industry, preferences, created_at")
      .eq("id", authId)
      .maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", authId),
  ]);
  const profile = profileResult.data;
  const roles = (rolesResult.data ?? []).map((row) => row.role);

  return {
    authId,
    email: (session.user.email ?? "").toLowerCase(),
    name: profile?.display_name?.trim() || fallbackName(session),
    organization: profile?.organization ?? "",
    jobTitle: profile?.job_title ?? "",
    country: profile?.country ?? "",
    industry: profile?.industry ?? "",
    preferences: asRecord(profile?.preferences),
    role: primaryRole(roles),
    joinedAt: profile?.created_at ?? session.user.created_at,
  };
}

/**
 * Real account provider. The session comes from Cloud sign-in; profile and
 * roles come from the protected profile and role records. Pages not yet moved
 * to Cloud still read their sample records from the local store, so the local
 * store is kept pointed at the same email address.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const database = useDatabase();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [session, setSession] = useState<Session | null>(null);
  const [sessionKnown, setSessionKnown] = useState(false);
  const [account, setAccount] = useState<MemberAccount | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const sessionRef = useRef<Session | null>(null);
  const authUserId = session?.user.id ?? null;

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      sessionRef.current = next;
      setSession(next);
      setSessionKnown(true);
      if (event === "USER_UPDATED") setReloadKey((key) => key + 1);
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      void router.invalidate();
      if (event !== "SIGNED_OUT") void queryClient.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [router, queryClient]);

  useEffect(() => {
    if (!sessionKnown) return;
    const current = sessionRef.current;
    if (!current) {
      setAccount(null);
      void api.users.signOut();
      return;
    }
    let cancelled = false;
    void (async () => {
      const next = await fetchAccount(current);
      if (!cancelled) setAccount(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [authUserId, sessionKnown, reloadKey]);

  const localUser = useMemo(() => {
    if (!account) return undefined;
    return database.users.find(
      (candidate) =>
        candidate.id === database.sessionUserId &&
        candidate.email.toLowerCase() === account.email,
    );
  }, [account, database.users, database.sessionUserId]);

  // Keep the local sample store pointed at the signed-in member (also after a sample-data reset).
  const localSessionId = database.sessionUserId;
  useEffect(() => {
    if (account && !localUser) void api.users.signIn(account.email, account.name);
  }, [account, localUser, localSessionId]);

  const user = useMemo<User | undefined>(() => {
    if (!account || !localUser) return undefined;
    return {
      ...localUser,
      name: account.name,
      email: account.email,
      role: account.role,
      organization: account.organization || undefined,
      jobTitle: account.jobTitle || undefined,
      location: account.country || undefined,
      joinedAt: account.joinedAt,
      notificationPreferences: readNotifications(account.preferences),
    };
  }, [account, localUser]);

  const signOut = useCallback(async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await api.users.signOut();
  }, [queryClient]);

  const updateProfile = useCallback(
    async (patch: ProfilePatch) => {
      if (!account) throw new Error("Sign in to update your profile.");
      const update: ProfileUpdate = {};
      const next: MemberAccount = { ...account };
      if (patch.name !== undefined) {
        next.name = patch.name.trim().slice(0, 120) || account.name;
        update.display_name = next.name;
      }
      if (patch.organization !== undefined) {
        next.organization = patch.organization.trim().slice(0, 160);
        update.organization = next.organization;
      }
      if (patch.jobTitle !== undefined) {
        next.jobTitle = patch.jobTitle.trim().slice(0, 120);
        update.job_title = next.jobTitle;
      }
      if (patch.location !== undefined) {
        next.country = patch.location.trim().slice(0, 80);
        update.country = next.country;
      }
      if (patch.notificationPreferences) {
        next.preferences = { ...account.preferences, notifications: patch.notificationPreferences };
        update.preferences = next.preferences as Json;
      }

      const { error } = await supabase.from("profiles").update(update).eq("id", account.authId);
      if (error) throw new Error("We couldn't save your profile. Please try again.");
      setAccount(next);
      if (localUser) await api.users.updateProfile(localUser.id, patch);
    },
    [account, localUser],
  );

  const role: UserRole = user?.role ?? "visitor";
  const ready = sessionKnown && (!session || user !== undefined);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      isSignedIn: session !== null,
      role,
      roleLabel: roleLabels[role],
      roleDescription: roleDescriptions[role],
      isAdmin: role === "administrator",
      canCreateSurveys: role !== "visitor",
      canManagePressReleases: role === "administrator" || role === "premium_customer",
      organizationName: user?.organization,
      signOut,
      updateProfile,
    }),
    [user, ready, session, role, signOut, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
