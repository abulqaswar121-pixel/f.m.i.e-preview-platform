import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { SignInPage } from "@/pages/SignInPage";

interface SignInSearch {
  next?: string | undefined;
}

export const Route = createFileRoute("/_site/signin")({
  component: SignInPage,
  validateSearch: (search: Record<string, unknown>): SignInSearch => ({
    next: typeof search["next"] === "string" ? search["next"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: `Sign in | ${site.name}` },
      { name: "description", content: "Simulated sign-in with one-click demonstration personas." },
    ],
  }),
});
