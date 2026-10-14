import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { PRDetailPage } from "@/pages/PRDetailPage";

export const Route = createFileRoute("/_site/press-releases/$id")({
  component: PRDetailPage,
  head: () => ({
    meta: [{ title: `Campaign Tracker | ${site.name}` }],
  }),
});
