import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/_site/shop/$slug")({
  beforeLoad: () => { throw redirect({ to: "/shop", replace: true }); },
});
