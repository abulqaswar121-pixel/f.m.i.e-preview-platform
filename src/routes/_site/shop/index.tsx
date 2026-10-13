import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { ShopPage } from "@/pages/ShopPage";

export const Route = createFileRoute("/_site/shop/")({
  component: ShopPage,
  head: () => ({
    meta: [
      { title: `Shop | ${site.name}` },
      {
        name: "description",
        content:
          "Branded apparel, stationery and accessories with published specifications and simulated checkout.",
      },
    ],
  }),
});
