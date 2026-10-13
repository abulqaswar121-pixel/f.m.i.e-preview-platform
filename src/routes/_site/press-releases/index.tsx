import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { PressReleasesPage } from "@/pages/PressReleasesPage";

export const Route = createFileRoute("/_site/press-releases/")({
  component: PressReleasesPage,
  head: () => ({
    meta: [
      { title: `Global Press Releases | ${site.name}` },
      {
        name: "description",
        content:
          "Three distribution tiers, a twelve-state tracked workflow and an administrator-verified channel catalogue. No placement is ever guaranteed.",
      },
    ],
  }),
});
