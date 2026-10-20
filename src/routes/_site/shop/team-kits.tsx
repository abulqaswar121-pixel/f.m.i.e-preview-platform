import { createFileRoute } from "@tanstack/react-router";

import { TeamKitsPage } from "@/pages/TeamKitsPage";

export const Route = createFileRoute("/_site/shop/team-kits")({
  component: TeamKitsPage,
});
