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
      { property: "og:title", content: `News & Insights | ${site.name}` },
      { property: "og:description", content: "Independent business reporting across ten editorial desks — global economy, markets, technology, governance and emerging markets." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://fmie.lovable.app/og-image.jpg" },
      { name: "twitter:image", content: "https://fmie.lovable.app/og-image.jpg" },
      {
        name: "description",
        content:
          "Independent business reporting across ten editorial desks — global economy, markets, technology, governance and emerging markets.",
      },
    ],
  }),
});
