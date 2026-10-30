import { createFileRoute } from "@tanstack/react-router";
import { ShopPage } from "@/pages/ShopPage";
export const Route = createFileRoute("/_site/shop/")({
  component: ShopPage,
  head: () => ({ meta: [{ title: "Sportswear & team kits | F.M.I.E" }, { name: "description", content: "Custom football, basketball, training and staff wear with your crest and colours." }, { property: "og:title", content: "Sportswear & team kits | F.M.I.E" }, { property: "og:description", content: "Custom football, basketball, training and staff wear with your crest and colours." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://fmie.lovable.app/og-image.jpg" },
      { name: "twitter:image", content: "https://fmie.lovable.app/og-image.jpg" }] }),
});
