import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { SurveysIndexPage } from "@/pages/SurveysIndexPage";

export const Route = createFileRoute("/_site/surveys/")({
  component: SurveysIndexPage,
  head: () => ({
    meta: [
      { title: `Survey Marketplace | ${site.name}` },
      { property: "og:title", content: `Survey Marketplace | ${site.name}` },
      { property: "og:description", content: "Live free and premium business surveys. Take part, or publish your own instrument with Likert, multiple-choice and long-text questions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://fmie.lovable.app/og-image.jpg" },
      { name: "twitter:image", content: "https://fmie.lovable.app/og-image.jpg" },
      {
        name: "description",
        content:
          "Live free and premium business surveys. Take part, or publish your own instrument with Likert, multiple-choice and long-text questions.",
      },
    ],
  }),
});
