import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { PRBookingPage } from "@/pages/PRBookingPage";

export const Route = createFileRoute("/_site/press-releases/book")({
  component: PRBookingPage,
  head: () => ({
    meta: [
      { title: `Book a Press Release | ${site.name}` },
      {
        name: "description",
        content:
          "Four-step booking wizard: company profile, content brief, tier and add-ons, then agreement to the commercial disclosure terms.",
      },
    ],
  }),
});
