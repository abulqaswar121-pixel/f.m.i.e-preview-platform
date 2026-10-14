import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { SurveyEthicsPage } from "@/pages/SurveyEthicsPage";

export const Route = createFileRoute("/_site/survey-ethics")({
  component: SurveyEthicsPage,
  head: () => ({
    meta: [
      { title: `Survey Ethics & Consent | ${site.name}` },
      {
        name: "description",
        content:
          "Consent, anonymity, question integrity, incentives, vulnerable respondents and the moderation checklist.",
      },
    ],
  }),
});
