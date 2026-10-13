import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { ProfessionalServicesPage } from "@/pages/ProfessionalServicesPage";

export const Route = createFileRoute("/_site/services/")({
  component: ProfessionalServicesPage,
  head: () => ({
    meta: [
      { title: `Professional Services | ${site.name}` },
      {
        name: "description",
        content:
          "Executive profile writing, digital marketing contracting, pitching advisory and Wikipedia policy guidance — scoped, dated and disclosed.",
      },
    ],
  }),
});
