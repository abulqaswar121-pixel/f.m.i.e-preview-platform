import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { ProductDetailPage } from "@/pages/ProductDetailPage";

export const Route = createFileRoute("/_site/shop/$slug")({
  component: ProductDetailPage,
  head: () => ({
    meta: [{ title: `Product | ${site.name}` }],
  }),
});
