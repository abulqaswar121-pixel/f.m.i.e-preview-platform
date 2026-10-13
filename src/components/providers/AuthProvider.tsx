import { useCallback, useMemo, type ReactNode } from "react";

import { AuthContext, type AuthContextValue } from "@/hooks/useAuth";
import { roleDescriptions, roleLabels } from "@/config/site";
import { api, useDatabase } from "@/services/api";
import type { User, UserRole } from "@/types";

/**
 * Auth provider & persona switcher host.
 *
 * Reads the session user straight from the simulated backend store, so signing
 * in, signing out or switching persona updates every consumer immediately —
 * no page reload and no extra fetching.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const database = useDatabase();

  const user = useMemo(
    () => database.users.find((candidate) => candidate.id === database.sessionUserId),
    [database.users, database.sessionUserId],
  );

  const personas = useMemo(
    () =>
      ["user-visitor", "user-survey-creator", "user-corporate-pr", "user-administrator"]
        .map((id) => database.users.find((candidate) => candidate.id === id))
        .filter((candidate): candidate is User => candidate !== undefined),
    [database.users],
  );

  const signIn = useCallback(
    async (email: string, name?: string) => api.users.signIn(email, name),
    [],
  );
  const switchPersona = useCallback(async (userId: string) => api.users.switchPersona(userId), []);
  const signOut = useCallback(async () => api.users.signOut(), []);

  const updateProfile = useCallback(
    async (patch: Partial<Omit<User, "id" | "role">>) => {
      if (!user) return;
      await api.users.updateProfile(user.id, patch);
    },
    [user],
  );

  const role: UserRole = user?.role ?? "visitor";

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      personas,
      role,
      roleLabel: roleLabels[role],
      roleDescription: roleDescriptions[role],
      isAdmin: role === "administrator",
      canCreateSurveys: role !== "visitor",
      canManagePressReleases: role === "administrator" || role === "premium_customer",
      organizationName: user?.organization,
      signIn,
      switchPersona,
      signOut,
      updateProfile,
    }),
    [user, personas, role, signIn, switchPersona, signOut, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
