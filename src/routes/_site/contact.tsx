import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { ContactPage } from "@/pages/ContactPage";

interface ContactSearch {
  department?: string | undefined;
}

export const Route = createFileRoute("/_site/contact")({
  component: ContactPage,
  validateSearch: (search: Record<string, unknown>): ContactSearch => ({
    department: typeof search["department"] === "string" ? search["department"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: `Contact | ${site.name}` },
      { property: "og:title", content: `Contact | ${site.name}` },
      { property: "og:description", content: "Contact F.M.I.E. Our presence covers Nigeria, UK, Canada, Australia, US, Asia and Africa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://fmie.lovable.app/og-image.jpg" },
      { name: "twitter:image", content: "https://fmie.lovable.app/og-image.jpg" },
      {
        name: "description",
        content: "Contact F.M.I.E. Our presence covers Nigeria, UK, Canada, Australia, US, Asia and Africa.",
      },
    ],
  }),
});
