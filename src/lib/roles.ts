import type { UserRole } from "@/types";

/**
 * Order in which saved account roles decide what a member sees. A member can
 * hold several roles; the highest one here becomes their main role.
 */
export const ROLE_PRECEDENCE: readonly UserRole[] = [
  "administrator",
  "corporate_account",
  "premium_customer",
  "survey_creator",
  "contributor",
  "earner",
  "registered_user",
];

/** Main role for a signed-in member. Unknown or missing roles fall back to a basic member. */
export function primaryRole(roles: readonly string[]): UserRole {
  for (const role of ROLE_PRECEDENCE) {
    if (roles.includes(role)) return role;
  }
  return "registered_user";
}
