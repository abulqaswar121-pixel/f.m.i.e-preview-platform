import { createContext, useContext } from "react";

import type { User, UserRole } from "@/types";

/**
 * Auth context contract.
 *
 * The provider component lives in `@/components/providers/AuthProvider` so this
 * module stays free of JSX and exports no components (fast-refresh friendly).
 *
 * The preview has no credential store: signing in accepts any valid-looking
 * email and lands on a pre-filled dashboard, and the header persona switcher
 * moves instantly between the four demo accounts without a page reload.
 */

export interface AuthContextValue {
  user: User | undefined;
  personas: User[];
  role: UserRole;
  roleLabel: string;
  roleDescription: string;
  isAdmin: boolean;
  canCreateSurveys: boolean;
  canManagePressReleases: boolean;
  organizationName: string | undefined;
  signIn: (email: string, name?: string) => Promise<User>;
  switchPersona: (userId: string) => Promise<User | undefined>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Omit<User, "id" | "role">>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>.");
  }
  return context;
}
