import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { PRDetailPage } from "@/pages/PRDetailPage";

export const Route = createFileRoute("/_site/press-releases/$id")({
  component: PRDetailPage,
  head: () => ({
    meta: [{ title: `Campaign Tracker | ${site.name}` },
      { name: "description", content: "Review press campaign details and status." },
      { property: "og:title", content: `Campaign Tracker | ${site.name}` },
      { property: "og:description", content: "Review press campaign details and status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },],
  }),
});
