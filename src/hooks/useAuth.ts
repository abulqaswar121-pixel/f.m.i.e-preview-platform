import { createContext, useContext } from "react";

import type { User, UserRole } from "@/types";

/**
 * Auth context contract.
 *
 * Identity, profile details and roles come from real Cloud accounts. The
 * provider lives in `@/components/providers/AuthProvider` so this module stays
 * free of JSX (fast-refresh friendly).
 */

export type ProfilePatch = Partial<
  Pick<User, "name" | "organization" | "jobTitle" | "location" | "notificationPreferences">
>;

export interface AuthContextValue {
  /** Signed-in member, or undefined for visitors (and while the account loads). */
  user: User | undefined;
  /** True once the session check has finished and any account has loaded. */
  ready: boolean;
  /** True when a real session exists, even before the profile has loaded. */
  isSignedIn: boolean;
  role: UserRole;
  roleLabel: string;
  roleDescription: string;
  isAdmin: boolean;
  canCreateSurveys: boolean;
  canManagePressReleases: boolean;
  organizationName: string | undefined;
  signOut: () => Promise<void>;
  updateProfile: (patch: ProfilePatch) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>.");
  }
  return context;
}
