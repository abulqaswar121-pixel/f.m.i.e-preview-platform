import { Link } from "@tanstack/react-router";
import type { ComponentProps } from "react";

type RouterLinkProps = ComponentProps<typeof Link>;

interface SiteLinkProps extends Omit<RouterLinkProps, "to" | "search" | "hash" | "params"> {
  /** Plain path, e.g. `/news` or `/press-releases/$id` already resolved. */
  to: string;
  /** Query parameters, kept separate from the path so the router can match. */
  search?: Record<string, unknown> | undefined;
  /** Fragment identifier, e.g. `catalogue`. */
  hash?: string | undefined;
}

/**
 * Config-driven navigation link.
 *
 * `src/config/site.ts` is the single source of truth for navigation and stores
 * plain paths plus optional `search` and `hash` values. TanStack Router types
 * `to` as a literal union of the generated route tree, so this wrapper is the
 * one documented place where that literal typing is relaxed — every navigation,
 * footer and search-result link keeps client-side routing through it.
 */
export function SiteLink({ to, search, hash, ...rest }: SiteLinkProps) {
  const props = { ...rest, to, search, hash } as unknown as RouterLinkProps;
  return <Link {...props} />;
}

export default SiteLink;
