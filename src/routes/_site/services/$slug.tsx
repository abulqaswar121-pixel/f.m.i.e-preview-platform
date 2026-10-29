import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { ServiceDetailPage } from "@/pages/ServiceDetailPage";

export const Route = createFileRoute("/_site/services/$slug")({
  component: ServiceDetailPage,
  head: () => ({
    meta: [{ title: `Service | ${site.name}` },
      { name: "description", content: "Explore F.M.I.E professional services and request a quote." },
      { property: "og:title", content: `Service | ${site.name}` },
      { property: "og:description", content: "Explore F.M.I.E professional services and request a quote." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://fmie.lovable.app/og-image.jpg" },
      { name: "twitter:image", content: "https://fmie.lovable.app/og-image.jpg" },],
  }),
});
