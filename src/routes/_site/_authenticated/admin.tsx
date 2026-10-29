import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { AdminPage } from "@/pages/AdminPage";

interface AdminSearch {
  tab?: string | undefined;
}

export const Route = createFileRoute("/_site/_authenticated/admin")({
  component: AdminPage,
  validateSearch: (search: Record<string, unknown>): AdminSearch => ({
    tab: typeof search["tab"] === "string" ? search["tab"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: `Administration | ${site.name}` },
      { property: "og:title", content: `Administration | ${site.name}` },
      { property: "og:description", content: "Moderation queue, plan configuration, channel verification, campaign oversight and commerce control." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://fmie.lovable.app/og-image.jpg" },
      { name: "twitter:image", content: "https://fmie.lovable.app/og-image.jpg" },
      {
        name: "description",
        content:
          "Moderation queue, plan configuration, channel verification, campaign oversight and commerce control.",
      },
    ],
  }),
});
