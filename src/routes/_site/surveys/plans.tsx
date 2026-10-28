import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { SurveyPlansPage } from "@/pages/SurveyPlansPage";

export const Route = createFileRoute("/_site/surveys/plans")({
  component: SurveyPlansPage,
  head: () => ({
    meta: [
      { title: `Survey Point Prices | ${site.name}` },
      { property: "og:title", content: `Survey Point Prices | ${site.name}` },
      { property: "og:description", content: "Pay as you go: buy survey points in dollars and use them to pay people who answer. No yearly plans." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      {
        name: "description",
        content:
          "Pay as you go: buy survey points in dollars and use them to pay people who answer. No yearly plans.",
      },
    ],
  }),
});
