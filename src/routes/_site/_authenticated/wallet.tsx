import { createFileRoute } from "@tanstack/react-router";

import { WalletPage } from "@/pages/WalletPage";

export const Route = createFileRoute("/_site/_authenticated/wallet")({
  component: WalletPage,
});
