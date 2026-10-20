import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";

import { PageHeader } from "@/components/common/Primitives";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";
import type { PRStatus, PressReleaseBooking } from "@/types";

const PIPELINE: { statuses: PRStatus[]; label: string }[] = [
  { statuses: ["draft"], label: "Draft" },
  { statuses: ["submitted"], label: "Submitted" },
  {
    statuses: ["under_review", "additional_info_required", "quote_sent", "awaiting_payment"],
    label: "Under Review",
  },
  { statuses: ["approved"], label: "Approved" },
  { statuses: ["in_production", "distribution_in_progress"], label: "In Production" },
  { statuses: ["completed"], label: "Published" },
];

function stageOf(status: PRStatus): number {
  return PIPELINE.findIndex((stage) => stage.statuses.includes(status));
}

/** Live six-stage pipeline for every press release the signed-in client owns. */
export function PressReleaseTrackerPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<PressReleaseBooking[]>([]);

  useEffect(() => {
    if (!user) {
      setBookings([]);
      return;
    }
    let alive = true;
    void api.pressReleases.list({ userId: user.id }).then((list) => {
      if (alive) setBookings(list);
    });
    return () => {
      alive = false;
    };
  }, [user]);

  return (
    <div>
      <PageHeader
        eyebrow="Order tracker"
        title="Press release pipeline"
        description="Draft → Submitted → Under Review → Approved → In Production → Published. Published releases carry the live article link recorded by the press desk."
        breadcrumb={[
          { label: "Home", to: "/" },
          { label: "Press releases", to: "/press-releases" },
          { label: "Tracker" },
        ]}
      />
      <div className="fmie-container space-y-6 py-10">
        {bookings.length === 0 ? (
          <p className="rounded-lg border border-brand-border bg-white p-8 text-center text-sm text-brand-slate shadow-sm">
            No press releases under this account yet. Book distribution to see the live pipeline
            here.
          </p>
        ) : (
          bookings.map((booking) => {
            const stage = stageOf(booking.status);
            const publishedUrl = booking.publishedUrls?.[0];
            return (
              <article
                key={booking.id}
                className="rounded-lg border border-brand-border bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-display text-lg font-bold text-brand-charcoal">
                    {booking.title}
                  </h2>
                  <p className="text-xs font-semibold text-brand-navy">{booking.referenceNumber}</p>
                </div>
                <ol className="mt-4 grid gap-2 sm:grid-cols-6">
                  {PIPELINE.map((entry, index) => (
                    <li
                      key={entry.label}
                      className={
                        index <= stage
                          ? "rounded-md bg-brand-navy px-2 py-1.5 text-center text-[11px] font-semibold text-white"
                          : "rounded-md border border-brand-border bg-brand-cream px-2 py-1.5 text-center text-[11px] font-semibold text-brand-slate"
                      }
                    >
                      {entry.label}
                    </li>
                  ))}
                </ol>
                {stage === 5 && publishedUrl ? (
                  <a
                    href={publishedUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-navy hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Live article: {publishedUrl}
                  </a>
                ) : null}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

export default PressReleaseTrackerPage;
