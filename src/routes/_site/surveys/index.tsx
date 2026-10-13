import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { SurveysIndexPage } from "@/pages/SurveysIndexPage";

export const Route = createFileRoute("/_site/surveys/")({
  component: SurveysIndexPage,
  head: () => ({
    meta: [
      { title: `Survey Marketplace | ${site.name}` },
      {
        name: "description",
        content:
          "Live free and premium business surveys. Take part, or publish your own instrument with Likert, multiple-choice and long-text questions.",
      },
    ],
  }),
});
