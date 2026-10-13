import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { SurveyDetailPage } from "@/pages/SurveyDetailPage";

interface SurveyDetailSearch {
  tab?: string | undefined;
}

export const Route = createFileRoute("/_site/surveys/$id")({
  component: SurveyDetailPage,
  validateSearch: (search: Record<string, unknown>): SurveyDetailSearch => ({
    tab: typeof search["tab"] === "string" ? search["tab"] : undefined,
  }),
  head: () => ({
    meta: [{ title: `Survey | ${site.name}` }],
  }),
});
