import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { PRBookingPage } from "@/pages/PRBookingPage";

const description = "Choose outlets and see prices first, write your press release with AI help, then review and pay last.";

export const Route = createFileRoute("/_site/press-releases/book")({
  component: PRBookingPage,
  head: () => ({
    meta: [
      { title: `Book a Press Release | ${site.name}` },
      { name: "description", content: description },
      { property: "og:title", content: `Book a Press Release | ${site.name}` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});
