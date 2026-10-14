import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { AdvertisingPage } from "@/pages/AdvertisingPage";

export const Route = createFileRoute("/_site/advertising")({
  component: AdvertisingPage,
  head: () => ({
    meta: [
      { title: `Advertising & Sponsorship | ${site.name}` },
      {
        name: "description",
        content:
          "What can be bought, what cannot, how commercial content is labelled, and the published rate card.",
      },
    ],
  }),
});
