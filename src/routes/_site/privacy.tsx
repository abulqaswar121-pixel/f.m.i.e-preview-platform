import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { PrivacyPage } from "@/pages/PrivacyPage";

export const Route = createFileRoute("/_site/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: `Privacy Notice | ${site.name}` },
      {
        name: "description",
        content:
          "What this preview stores, where it lives, and what a live deployment would be required to do.",
      },
    ],
  }),
});
