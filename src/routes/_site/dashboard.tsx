import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { DashboardPage } from "@/pages/DashboardPage";

interface DashboardSearch {
  tab?: string | undefined;
}

export const Route = createFileRoute("/_site/dashboard")({
  component: DashboardPage,
  validateSearch: (search: Record<string, unknown>): DashboardSearch => ({
    tab: typeof search["tab"] === "string" ? search["tab"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: `My Dashboard | ${site.name}` },
      {
        name: "description",
        content: "Surveys, press campaigns, orders and account settings in one member view.",
      },
    ],
  }),
});
