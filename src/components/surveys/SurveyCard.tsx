import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarClock, Clock, Users } from "lucide-react";

import { Badge } from "@/components/common/Badge";
import { formatDate } from "@/config/site";
import type { Survey } from "@/types";
import { cn } from "@/lib/utils";

function tierTone(tier: Survey["tier"]): "gold" | "navy" | "info" {
  if (tier === "premium") return "gold";
  if (tier === "corporate") return "info";
  return "navy";
}

export function SurveyCard({
  survey,
  showStatus = false,
}: {
  survey: Survey;
  showStatus?: boolean;
}) {
  const fillPercent = Math.min(
    100,
    Math.round((survey.responseCount / Math.max(survey.responseLimit, 1)) * 100),
  );
  const closingSoon =
    survey.status === "active" &&
    new Date(survey.closingDate).getTime() - Date.now() < 21 * 86_400_000;

  return (
    <article className="group flex h-full flex-col rounded-lg border border-brand-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={tierTone(survey.tier)}>{survey.tier}</Badge>
        <Badge tone="cream">{survey.category}</Badge>
        {showStatus ? (
          <Badge
            tone={
              survey.status === "active"
                ? "success"
                : survey.status === "pending_moderation"
                  ? "warning"
                  : survey.status === "closed"
                    ? "muted"
                    : "info"
            }
          >
            {survey.status.replace(/_/g, " ")}
          </Badge>
        ) : null}
        {closingSoon ? <Badge tone="warning">Closing soon</Badge> : null}
      </div>

      <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-brand-charcoal">
        <Link to="/surveys/$id" params={{ id: survey.id }} className="hover:text-brand-navy">
          {survey.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-brand-slate">
        {survey.objective}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-brand-slate">
        <span className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-brand-navy" />
          {survey.responseCount.toLocaleString("en-GB")} responses
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-brand-navy" />~{survey.estimatedMinutes} min
        </span>
        <span className="col-span-2 flex items-center gap-1.5">
          <CalendarClock className="h-3.5 w-3.5 text-brand-navy" />
          Closes {formatDate(survey.closingDate)}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-[11px] text-brand-slate">
          <span>Response capacity</span>
          <span className="tabular-nums">
            {survey.responseCount.toLocaleString("en-GB")} /{" "}
            {survey.responseLimit.toLocaleString("en-GB")}
          </span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-brand-border">
          <div
            className={cn(
              "h-full rounded-full",
              fillPercent >= 100 ? "bg-brand-slate" : "bg-brand-navy",
            )}
            style={{ width: `${Math.max(fillPercent, 2)}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-brand-border pt-3">
        <span className="text-xs text-brand-slate">By {survey.creatorName}</span>
        <Link
          to="/surveys/$id"
          params={{ id: survey.id }}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-navy hover:underline"
        >
          {survey.status === "active" ? "Take part" : "View survey"}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}

export default SurveyCard;
