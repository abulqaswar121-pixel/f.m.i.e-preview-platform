import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { HomePage } from "@/pages/HomePage";

export const Route = createFileRoute("/_site/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: `${site.name} — ${site.tagline} | ${site.mission}` },
      { name: "description", content: site.description },
    ],
  }),
});
