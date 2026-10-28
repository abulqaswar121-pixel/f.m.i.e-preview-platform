import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/_site/checkout")({
  beforeLoad: () => { throw redirect({ to: "/shop", replace: true }); },
});
