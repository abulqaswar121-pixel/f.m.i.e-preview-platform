import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { SurveyPlansPage } from "@/pages/SurveyPlansPage";

export const Route = createFileRoute("/_site/surveys/plans")({
  component: SurveyPlansPage,
  head: () => ({
    meta: [
      { title: `Research Plans & Pricing | ${site.name}` },
      {
        name: "description",
        content:
          "Free, Premium and Corporate research plans, configured by an administrator rather than hardcoded in the interface.",
      },
    ],
  }),
});
