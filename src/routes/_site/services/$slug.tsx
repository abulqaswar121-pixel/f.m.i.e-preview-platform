import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { ServiceDetailPage } from "@/pages/ServiceDetailPage";

export const Route = createFileRoute("/_site/services/$slug")({
  component: ServiceDetailPage,
  head: () => ({
    meta: [{ title: `Service | ${site.name}` }],
  }),
});
