import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { AboutPage } from "@/pages/AboutPage";

export const Route = createFileRoute("/_site/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: `About | ${site.name}` },
      { property: "og:title", content: `About | ${site.name}` },
      { property: "og:description", content: `${site.mission} Mission, values, editorial team and the platform roadmap.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://fmie.lovable.app/og-image.jpg" },
      { name: "twitter:image", content: "https://fmie.lovable.app/og-image.jpg" },
      {
        name: "description",
        content: `${site.mission} Mission, values, editorial team and the platform roadmap.`,
      },
    ],
  }),
});
