import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { RegisterPage } from "@/pages/RegisterPage";

export const Route = createFileRoute("/_site/register")({
  component: RegisterPage,
  head: () => ({
    meta: [
      { title: `Create an account | ${site.name}` },
      { property: "og:title", content: `Create an account | ${site.name}` },
      { property: "og:description", content: "One account across research, distribution, services and commerce." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      {
        name: "description",
        content: "One account across research, distribution, services and commerce.",
      },
    ],
  }),
});
