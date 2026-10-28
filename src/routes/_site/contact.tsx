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
      { property: "og:description", content: "Contact F.M.I.E at our Lagos head office or find our international offices." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      {
        name: "description",
        content: "Contact F.M.I.E at our Lagos head office or find our international offices.",
      },
    ],
  }),
});
