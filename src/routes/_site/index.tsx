import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { HomePage } from "@/pages/HomePage";

export const Route = createFileRoute("/_site/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: `${site.name} — ${site.tagline} | ${site.mission}` },
      { property: "og:title", content: `${site.name} — ${site.tagline} | ${site.mission}` },
      { property: "og:description", content: site.description },
    ] },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "description", content: site.description },
    ],
  }),
});
