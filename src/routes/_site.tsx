import { createFileRoute } from "@tanstack/react-router";

import { AppLayout } from "@/components/layout/AppLayout";

/**
 * Pathless layout route: every page below `_site/` renders inside the shared
 * header, market ticker, footer, cart drawer and toast surface.
 */
export const Route = createFileRoute("/_site")({
  component: AppLayout,
});
