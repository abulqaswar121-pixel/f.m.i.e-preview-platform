import { OutletBookingFlow } from "@/components/press/OutletBookingFlow";
import { PageHeader } from "@/components/common/Primitives";

export function PRBookingPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Booking wizard"
        title="Write your release first, pay when it's ready"
        description="Draft your article with AI help, choose your partner outlets, settle the simulated checkout, then submit to the press desk. You'll get a reference number straight away."
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
