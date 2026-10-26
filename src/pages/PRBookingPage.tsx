import { OutletBookingFlow } from "@/components/press/OutletBookingFlow";
import { PageHeader } from "@/components/common/Primitives";

export function PRBookingPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Booking wizard"
        title="Write your release first, pay when it's ready"
        description="Write your article with AI help and choose your outlets. Pay only when it's ready — then it goes straight to our press desk and you get a booking number."
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
