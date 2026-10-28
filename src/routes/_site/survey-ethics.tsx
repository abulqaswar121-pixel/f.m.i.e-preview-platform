import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { SurveyEthicsPage } from "@/pages/SurveyEthicsPage";

export const Route = createFileRoute("/_site/survey-ethics")({
  component: SurveyEthicsPage,
  head: () => ({
    meta: [
      { title: `Survey Ethics & Consent | ${site.name}` },
      { property: "og:title", content: `Survey Ethics & Consent | ${site.name}` },
      { property: "og:description", content: "Consent, anonymity, question integrity, incentives, vulnerable respondents and the moderation checklist." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      {
        name: "description",
        content:
          "Consent, anonymity, question integrity, incentives, vulnerable respondents and the moderation checklist.",
      },
    ],
  }),
});
