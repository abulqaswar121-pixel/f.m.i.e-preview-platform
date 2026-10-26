import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { PressReleaseTrackerPage } from "@/pages/PressReleaseTrackerPage";

export const Route = createFileRoute("/_site/press-releases/tracker")({
  component: PressReleaseTrackerPage,
  head: () => ({
    meta: [
      { title: `My press releases | ${site.name}` },
      { name: "description", content: "See where each of your press releases is, from payment to published." },
      { property: "og:title", content: `My press releases | ${site.name}` },
      { property: "og:description", content: "See where each of your press releases is, from payment to published." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});
