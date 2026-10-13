import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { NewsIndexPage } from "@/pages/NewsIndexPage";

interface NewsSearch {
  category?: string | undefined;
}

export const Route = createFileRoute("/_site/news/")({
  component: NewsIndexPage,
  validateSearch: (search: Record<string, unknown>): NewsSearch => ({
    category: typeof search["category"] === "string" ? search["category"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: `News & Insights | ${site.name}` },
      {
        name: "description",
        content:
          "Independent business reporting across ten editorial desks — global economy, markets, technology, governance and emerging markets.",
      },
    ],
  }),
});
