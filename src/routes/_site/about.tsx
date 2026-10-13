import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { AboutPage } from "@/pages/AboutPage";

export const Route = createFileRoute("/_site/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: `About | ${site.name}` },
      {
        name: "description",
        content: `${site.mission} Mission, values, editorial team and the platform roadmap.`,
      },
    ],
  }),
});
