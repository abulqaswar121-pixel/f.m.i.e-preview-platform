import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { TermsPage } from "@/pages/TermsPage";

export const Route = createFileRoute("/_site/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: `Terms & Conditions | ${site.name}` },
      {
        name: "description",
        content:
          "Terms covering accounts, editorial content, surveys, distribution, services and commerce.",
      },
    ],
  }),
});
