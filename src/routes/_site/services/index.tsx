import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { ProfessionalServicesPage } from "@/pages/ProfessionalServicesPage";

export const Route = createFileRoute("/_site/services/")({
  component: ProfessionalServicesPage,
  head: () => ({
    meta: [
      { title: `Professional Services | ${site.name}` },
      { property: "og:title", content: `Professional Services | ${site.name}` },
      { property: "og:description", content: "Executive profile writing, digital marketing contracting, pitching advisory and Wikipedia policy guidance — scoped, dated and disclosed." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://fmie.lovable.app/og-image.jpg" },
      { name: "twitter:image", content: "https://fmie.lovable.app/og-image.jpg" },
      {
        name: "description",
        content:
          "Executive profile writing, digital marketing contracting, pitching advisory and Wikipedia policy guidance — scoped, dated and disclosed.",
      },
    ],
  }),
});
