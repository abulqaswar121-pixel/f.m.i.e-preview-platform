import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { DashboardPage } from "@/pages/DashboardPage";

interface DashboardSearch {
  tab?: string | undefined;
}

export const Route = createFileRoute("/_site/_authenticated/dashboard")({
  component: DashboardPage,
  validateSearch: (search: Record<string, unknown>): DashboardSearch => ({
    tab: typeof search["tab"] === "string" ? search["tab"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: `My Dashboard | ${site.name}` },
      { property: "og:title", content: `My Dashboard | ${site.name}` },
      { property: "og:description", content: "Surveys, press campaigns, orders and account settings in one member view." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://fmie.lovable.app/og-image.jpg" },
      { name: "twitter:image", content: "https://fmie.lovable.app/og-image.jpg" },
      {
        name: "description",
        content: "Surveys, press campaigns, orders and account settings in one member view.",
      },
    ],
  }),
});
