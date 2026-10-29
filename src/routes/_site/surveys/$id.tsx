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
    meta: [{ title: `Survey | ${site.name}` },
      { name: "description", content: "Read the survey details, reward and consent notice before answering." },
      { property: "og:title", content: `Survey | ${site.name}` },
      { property: "og:description", content: "Read the survey details, reward and consent notice before answering." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://fmie.lovable.app/og-image.jpg" },
      { name: "twitter:image", content: "https://fmie.lovable.app/og-image.jpg" },],
  }),
});
