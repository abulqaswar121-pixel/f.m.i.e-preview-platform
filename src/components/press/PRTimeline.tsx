import { Check, Circle, X } from "lucide-react";

import { formatDateTime, prStatuses, prWorkflowStages } from "@/config/site";
import type { PressReleaseBooking } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Live tracker: the twelve workflow states rendered as five stages, plus the
 * full dated event log recorded against the campaign.
 */
export function PRTimeline({ booking }: { booking: PressReleaseBooking }) {
  const definition = prStatuses.find((entry) => entry.id === booking.status);
  const isTerminalFailure = booking.status === "rejected" || booking.status === "cancelled";
  const currentStage = definition?.stage ?? 0;

  return (
    <div className="space-y-6">
      <ol className="grid gap-3 sm:grid-cols-5">
        {prWorkflowStages.map((stage) => {
          const reached = !isTerminalFailure && stage.stage <= currentStage;
          const isCurrent = !isTerminalFailure && stage.stage === currentStage;
          return (
            <li key={stage.stage} className="relative">
              <div
                className={cn(
                  "rounded-lg border px-3 py-3",
                  reached ? "border-brand-navy/40 bg-brand-navy/5" : "border-brand-border bg-white",
                  isCurrent && "ring-2 ring-brand-gold",
                  isTerminalFailure && stage.stage === 5 && "border-danger/40 bg-danger/8",
                )}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-slate">
                  Stage {stage.stage}
                </p>
                <p className="mt-1 text-xs font-semibold leading-snug text-brand-charcoal">
                  {stage.label}
                </p>
                <p className="mt-2 flex flex-wrap gap-1">
                  {stage.statuses.map((statusId) => {
                    const status = prStatuses.find((entry) => entry.id === statusId);
                    const isBookingStatus = booking.status === statusId;
                    return (
                      <span
                        key={statusId}
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium",
                          isBookingStatus
                            ? status?.tone === "danger"
                              ? "bg-danger text-white"
                              : status?.tone === "success"
                                ? "bg-success text-white"
                                : "bg-brand-navy text-white"
                            : "bg-brand-cream text-brand-slate",
                        )}
                      >
                        {status?.label}
                      </span>
                    );
                  })}
                </p>
              </div>
              {stage.stage < 5 ? (
                <span
                  className="absolute -right-2 top-1/2 hidden h-px w-4 -translate-y-1/2 bg-brand-border sm:block"
                  aria-hidden="true"
                />
              ) : null}
            </li>
          );
        })}
      </ol>

      {isTerminalFailure ? (
        <p className="rounded-md border border-danger/40 bg-danger/8 px-4 py-3 text-sm text-danger">
          This campaign is <strong>{booking.status}</strong>. The recorded reason appears in the
          event log below.
        </p>
      ) : null}

      <div className="rounded-lg border border-brand-border bg-white">
        <h3 className="border-b border-brand-border px-5 py-3 font-display text-base font-semibold text-brand-charcoal">
          Event log
        </h3>
        <ol className="relative space-y-5 px-5 py-5">
          <span
            className="absolute bottom-6 left-[2.05rem] top-6 w-px bg-brand-border"
            aria-hidden="true"
          />
          {booking.timeline.map((event, index) => {
            const status = prStatuses.find((entry) => entry.id === event.status);
            const negative = event.status === "rejected" || event.status === "cancelled";
            return (
              <li key={`${event.at}-${index}`} className="relative flex gap-4">
                <span
                  className={cn(
                    "relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                    negative
                      ? "border-danger bg-danger text-white"
                      : status?.tone === "success"
                        ? "border-success bg-success text-white"
                        : "border-brand-navy bg-white text-brand-navy",
                  )}
                >
                  {negative ? <X className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                </span>
                <div className="min-w-0 pb-1">
                  <p className="flex flex-wrap items-baseline gap-2 text-sm">
                    <span className="font-semibold text-brand-charcoal">
                      {status?.label ?? event.status}
                    </span>
                    <span className="text-xs tabular-nums text-brand-slate">
                      {formatDateTime(event.at)}
                    </span>
                    <span className="text-xs text-brand-slate">· {event.actor}</span>
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-brand-slate">{event.note}</p>
                </div>
              </li>
            );
          })}
          <li className="relative flex gap-4 opacity-60">
            <span className="relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-dashed border-brand-slate bg-white text-brand-slate">
              <Circle className="h-3 w-3" />
            </span>
            <p className="text-sm text-brand-slate">
              Further workflow events will be appended here as the campaign progresses.
            </p>
          </li>
        </ol>
      </div>
    </div>
  );
}

export default PRTimeline;
