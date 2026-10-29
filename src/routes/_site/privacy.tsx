import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { PrivacyPage } from "@/pages/PrivacyPage";

export const Route = createFileRoute("/_site/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: `Privacy Notice | ${site.name}` },
      { property: "og:title", content: `Privacy Notice | ${site.name}` },
      { property: "og:description", content: "How F.M.I.E handles account details, survey answers, private uploads and test payments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://fmie.lovable.app/og-image.jpg" },
      { name: "twitter:image", content: "https://fmie.lovable.app/og-image.jpg" },
      {
        name: "description",
        content:
          "How F.M.I.E handles account details, survey answers, private uploads and test payments.",
      },
    ],
  }),
});
