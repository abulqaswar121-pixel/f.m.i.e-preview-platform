import { PRBookingWizard } from "@/components/press/PRBookingWizard";
import { PageHeader } from "@/components/common/Primitives";

export function PRBookingPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Booking wizard"
        title="Book a press release in four steps"
        description="Company profile, content brief, tier and add-ons, then agreement to the commercial disclosure terms. A reference number is issued the moment you submit."
        breadcrumb={[
          { label: "Home", to: "/" },
          { label: "Global Press Releases", to: "/press-releases" },
          { label: "Book" },
        ]}
      />
      <div className="fmie-container py-10">
        <PRBookingWizard />
      </div>
    </div>
  );
}

export default PRBookingPage;
