import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { AdvertisingPage } from "@/pages/AdvertisingPage";

export const Route = createFileRoute("/_site/advertising")({
  component: AdvertisingPage,
  head: () => ({
    meta: [
      { title: `Advertising & Sponsorship | ${site.name}` },
      { property: "og:title", content: `Advertising & Sponsorship | ${site.name}` },
      { property: "og:description", content: "What can be bought, what cannot, how commercial content is labelled, and the published rate card." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://fmie.lovable.app/og-image.jpg" },
      { name: "twitter:image", content: "https://fmie.lovable.app/og-image.jpg" },
      {
        name: "description",
        content:
          "What can be bought, what cannot, how commercial content is labelled, and the published rate card.",
      },
    ],
  }),
});
