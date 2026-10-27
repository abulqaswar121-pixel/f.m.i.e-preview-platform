import { OutletBookingFlow } from "@/components/press/OutletBookingFlow";
import { PageHeader } from "@/components/common/Primitives";

export function PRBookingPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Booking wizard"
        title="See the price first, pay when it's ready"
        description="Pick your outlets and see the total. Then write your story with AI help. You pay only at the end — then it goes to our press desk and you get a booking number."
        breadcrumb={[
          { label: "Home", to: "/" },
          { label: "Global Press Releases", to: "/press-releases" },
          { label: "Book" },
        ]}
      />
      <div className="fmie-container py-10">
        <OutletBookingFlow />
      </div>
    </div>
  );
}

export default PRBookingPage;
