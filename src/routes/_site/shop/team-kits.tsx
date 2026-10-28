import { createFileRoute } from "@tanstack/react-router";
import { TeamKitsPage } from "@/pages/TeamKitsPage";
export const Route = createFileRoute("/_site/shop/team-kits")({
  component: TeamKitsPage,
  head: () => ({ meta: [{ title: "Team kits | F.M.I.E" }, { name: "description", content: "Request custom team kits and view your saved quotes." }, { property: "og:title", content: "Team kits | F.M.I.E" }, { property: "og:description", content: "Request custom team kits and view your saved quotes." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
});
