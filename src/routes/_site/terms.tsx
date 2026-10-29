import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { TermsPage } from "@/pages/TermsPage";

export const Route = createFileRoute("/_site/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: `Terms & Conditions | ${site.name}` },
      { property: "og:title", content: `Terms & Conditions | ${site.name}` },
      { property: "og:description", content: "Terms covering accounts, editorial content, surveys, distribution, services and commerce." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://fmie.lovable.app/og-image.jpg" },
      { name: "twitter:image", content: "https://fmie.lovable.app/og-image.jpg" },
      {
        name: "description",
        content:
          "Terms covering accounts, editorial content, surveys, distribution, services and commerce.",
      },
    ],
  }),
});
