import { createFileRoute } from "@tanstack/react-router";

import { WalletPage } from "@/pages/WalletPage";

export const Route = createFileRoute("/_site/_authenticated/wallet")({
  component: WalletPage,
  head: () => ({ meta: [
    { title: "Wallet | F.M.I.E" },
    { name: "description", content: "View your dollar balance, buy survey points and request a withdrawal." },
    { property: "og:title", content: "Wallet | F.M.I.E" },
    { property: "og:description", content: "View your dollar balance, buy survey points and request a withdrawal." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
});
