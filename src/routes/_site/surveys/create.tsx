import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { SurveyCreatePage } from "@/pages/SurveyCreatePage";

export const Route = createFileRoute("/_site/surveys/create")({
  component: SurveyCreatePage,
  head: () => ({
    meta: [
      { title: `Create a Survey | ${site.name}` },
      {
        name: "description",
        content:
          "Multi-step survey builder with conditional logic, live preview, draft saving, scheduling and a consent notice.",
      },
    ],
  }),
});
