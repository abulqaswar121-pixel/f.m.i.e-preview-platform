import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { ArticleDetailPage } from "@/pages/ArticleDetailPage";

export const Route = createFileRoute("/_site/news/$slug")({
  component: ArticleDetailPage,
  head: () => ({
    meta: [{ title: `Article | ${site.name}` },
      { name: "description", content: "Read F.M.I.E sample business news and insights." },
      { property: "og:title", content: `Article | ${site.name}` },
      { property: "og:description", content: "Read F.M.I.E sample business news and insights." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://fmie.lovable.app/og-image.jpg" },
      { name: "twitter:image", content: "https://fmie.lovable.app/og-image.jpg" },],
  }),
});
