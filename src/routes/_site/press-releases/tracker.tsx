import { createFileRoute } from "@tanstack/react-router";

import { PressReleaseTrackerPage } from "@/pages/PressReleaseTrackerPage";

export const Route = createFileRoute("/_site/press-releases/tracker")({
  component: PressReleaseTrackerPage,
});
