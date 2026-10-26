import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink, Loader2 } from "lucide-react";

import { PageHeader } from "@/components/common/Primitives";
import { useAuth } from "@/hooks/useAuth";
import { formatUsd } from "@/lib/outlet-pricing";
import { listMyPressBookings, type CloudPressBooking } from "@/lib/press-bookings.functions";

const PIPELINE: { statuses: string[]; label: string }[] = [
  { statuses: ["awaiting_payment"], label: "Written" },
  { statuses: ["submitted"], label: "Paid & sent" },
  { statuses: ["under_review", "additional_info_required"], label: "In review" },
  { statuses: ["approved"], label: "Approved" },
  { statuses: ["in_production", "distribution_in_progress"], label: "Going out" },
  { statuses: ["completed"], label: "Published" },
];

const STATUS_TEXT: Record<string, string> = {
  awaiting_payment: "Waiting for payment",
  submitted: "Paid — with the press desk",
  under_review: "Being reviewed",
  additional_info_required: "We need more details from you",
  approved: "Approved",
  in_production: "Being prepared",
  distribution_in_progress: "Being sent to outlets",
  completed: "Published",
  rejected: "Not accepted",
};

function stageOf(status: string): number {
  return PIPELINE.findIndex((stage) => stage.statuses.includes(status));
}

/** Every press release the signed-in member has booked, saved in the database. */
export function PressReleaseTrackerPage() {
  const { user } = useAuth();
  const listBookings = useServerFn(listMyPressBookings);
  const [bookings, setBookings] = useState<CloudPressBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setBookings([]);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    void listBookings()
      .then((list) => {
        if (alive) setBookings(list);
      })
      .catch((err: unknown) => {
        if (alive) setError(err instanceof Error ? err.message : "Your press releases could not be loaded.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [user, listBookings]);

  return (
    <div>
      <PageHeader
        eyebrow="My requests"
        title="Your press releases"
        description="See where each release is, from payment to published, with the live link at the end."
        breadcrumb={[
          { label: "Home", to: "/" },
          { label: "Press releases", to: "/press-releases" },
          { label: "My requests" },
        ]}
      />
      <div className="fmie-container space-y-6 py-10">
        {!user ? (
          <p className="rounded-lg border border-brand-border bg-white p-8 text-center text-sm text-brand-slate shadow-sm">
            Please <a className="font-semibold text-brand-navy underline" href="/signin?next=%2Fpress-releases%2Ftracker">sign in</a> to see your press releases.
          </p>
        ) : loading ? (
          <p className="flex items-center justify-center gap-2 py-10 text-sm text-brand-slate">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading your press releases…
          </p>
        ) : error ? (
          <p className="rounded-lg border border-brand-border bg-white p-8 text-center text-sm text-brand-slate">{error}</p>
        ) : bookings.length === 0 ? (
          <p className="rounded-lg border border-brand-border bg-white p-8 text-center text-sm text-brand-slate shadow-sm">
            No press releases yet.{" "}
            <a className="font-semibold text-brand-navy underline" href="/press-releases/book">Book one</a> and it
            will show here.
          </p>
        ) : (
          bookings.map((booking) => {
            const stage = stageOf(booking.status);
            const publishedUrl = booking.publishedUrls[0];
            return (
              <article key={booking.id} className="rounded-lg border border-brand-border bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="min-w-0 break-words font-display text-lg font-bold text-brand-charcoal">{booking.title}</h2>
                  <p className="text-xs font-semibold text-brand-navy">{booking.referenceNumber}</p>
                </div>
                <p className="mt-1 text-xs text-brand-slate">
                  {STATUS_TEXT[booking.status] ?? booking.status} · {formatUsd(booking.priceUsdCents / 100)} ·{" "}
                  {booking.outlets.length} outlet{booking.outlets.length === 1 ? "" : "s"} ·{" "}
                  {new Date(booking.createdAt).toLocaleDateString()}
                </p>
                {booking.outlets.length ? (
                  <p className="mt-1 break-words text-xs text-brand-slate">{booking.outlets.join(", ")}</p>
                ) : null}
                {booking.status === "rejected" ? null : (
                  <ol className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
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
                )}
                {booking.status === "awaiting_payment" ? (
                  <p className="mt-3 text-xs text-brand-slate">
                    Not paid yet. If you already paid, it will update here once Paystack confirms.
                  </p>
                ) : null}
                {publishedUrl ? (
                  <a
                    href={publishedUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-3 inline-flex max-w-full items-center gap-1.5 break-all text-xs font-semibold text-brand-navy hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" /> Live article: {publishedUrl}
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
