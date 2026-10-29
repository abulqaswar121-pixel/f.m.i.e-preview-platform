import { createFileRoute } from "@tanstack/react-router";
import { ShopPage } from "@/pages/ShopPage";
export const Route = createFileRoute("/_site/shop/")({
  component: ShopPage,
  head: () => ({ meta: [{ title: "Shop | F.M.I.E" }, { name: "description", content: "Custom team kits and merchandise enquiries." }, { property: "og:title", content: "Shop | F.M.I.E" }, { property: "og:description", content: "Custom team kits and merchandise enquiries." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://fmie.lovable.app/og-image.jpg" },
      { name: "twitter:image", content: "https://fmie.lovable.app/og-image.jpg" }] }),
});
