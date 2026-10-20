import { OutletBookingFlow } from "@/components/press/OutletBookingFlow";
import { PageHeader } from "@/components/common/Primitives";

export function PRBookingPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Booking wizard"
        title="Book press distribution in three steps"
        description="Select partner outlets with a live ₦/$ total, settle the simulated checkout, then submit your story with the mandatory editorial notice. A reference number is issued on submission."
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
