import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { EditorialPolicyPage } from "@/pages/EditorialPolicyPage";

export const Route = createFileRoute("/_site/editorial-policy")({
  component: EditorialPolicyPage,
  head: () => ({
    meta: [
      { title: `Editorial & Media Policy | ${site.name}` },
      {
        name: "description",
        content:
          "Disclosure taxonomy, sourcing standards, corrections, rights of reply and conflicts of interest.",
      },
    ],
  }),
});
