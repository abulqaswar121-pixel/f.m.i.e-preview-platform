import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { RegisterPage } from "@/pages/RegisterPage";

export const Route = createFileRoute("/_site/register")({
  component: RegisterPage,
  head: () => ({
    meta: [
      { title: `Create an account | ${site.name}` },
      {
        name: "description",
        content: "One account across research, distribution, services and commerce.",
      },
    ],
  }),
});
