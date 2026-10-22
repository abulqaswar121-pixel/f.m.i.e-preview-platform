import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_site/index")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
});