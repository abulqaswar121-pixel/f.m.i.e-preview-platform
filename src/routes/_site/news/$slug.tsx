import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { ArticleDetailPage } from "@/pages/ArticleDetailPage";

export const Route = createFileRoute("/_site/news/$slug")({
  component: ArticleDetailPage,
  head: () => ({
    meta: [{ title: `Article | ${site.name}` }],
  }),
});
