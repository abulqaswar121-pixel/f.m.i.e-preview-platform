import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { AdminPage } from "@/pages/AdminPage";

interface AdminSearch {
  tab?: string | undefined;
}

export const Route = createFileRoute("/_site/admin")({
  component: AdminPage,
  validateSearch: (search: Record<string, unknown>): AdminSearch => ({
    tab: typeof search["tab"] === "string" ? search["tab"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: `Administration | ${site.name}` },
      {
        name: "description",
        content:
          "Moderation queue, plan configuration, channel verification, campaign oversight and commerce control.",
      },
    ],
  }),
});
