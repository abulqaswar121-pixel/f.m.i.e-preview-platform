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
      {
        name: "description",
        content: "Four accountable desks, London head office and expected response times.",
      },
    ],
  }),
});
