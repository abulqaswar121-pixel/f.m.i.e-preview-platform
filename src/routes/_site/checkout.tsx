import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/config/site";
import { CheckoutPage } from "@/pages/CheckoutPage";

export const Route = createFileRoute("/_site/checkout")({
  component: CheckoutPage,
  head: () => ({
    meta: [
      { title: `Checkout | ${site.name}` },
      {
        name: "description",
        content:
          "Simulated checkout: delivery details, shipping method, payment method and invoice.",
      },
    ],
  }),
});
