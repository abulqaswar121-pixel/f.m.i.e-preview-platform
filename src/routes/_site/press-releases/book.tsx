import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { PRBookingPage } from "@/pages/PRBookingPage";

const description = "Write your press release with AI help, choose your outlets, then pay with Paystack and send it to our press desk.";

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
