import { createFileRoute } from "@tanstack/react-router";

import { WalletPage } from "@/pages/WalletPage";

export const Route = createFileRoute("/_site/wallet")({
  component: WalletPage,
});
