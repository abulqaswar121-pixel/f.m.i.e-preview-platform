import type { ReactNode } from "react";
import { ArrowRight, Inbox } from "lucide-react";

import { SiteLink } from "@/components/common/SiteLink";

import { Badge, type BadgeTone } from "@/components/common/Badge";
import { cn } from "@/lib/utils";
import type { DisclosureTag } from "@/types";

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("fmie-eyebrow", className)}>{children}</p>;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
  align = "left",
}: {
  eyebrow?: string | undefined;
  title: string;
  description?: string | undefined;
  action?: { label: string; to: string } | undefined;
  className?: string | undefined;
  align?: "left" | "center" | undefined;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
        align === "center" && "md:flex-col md:items-center md:text-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h2 className="mt-2 font-display text-2xl font-bold text-brand-charcoal sm:text-3xl">
          {title}
        </h2>
        <span
          className={cn("fmie-rule mt-3", align === "center" && "mx-auto")}
          aria-hidden="true"
        />
        {description ? (
          <p className="mt-3 text-sm leading-relaxed text-brand-slate sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action ? (
        <SiteLink
          to={action.to}
          className="group inline-flex items-center gap-2 text-sm font-semibold text-brand-navy underline-offset-4 hover:underline"
        >
          {action.label}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </SiteLink>
      ) : null}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  breadcrumb,
}: {
  eyebrow: string;
  title: string;
  description?: string | undefined;
  children?: ReactNode | undefined;
  breadcrumb?: { label: string; to?: string | undefined }[] | undefined;
}) {
  return (
    <header className="border-b border-brand-border bg-white">
      <div className="fmie-container py-10 sm:py-14">
        {breadcrumb && breadcrumb.length > 0 ? (
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-brand-slate"
          >
            {breadcrumb.map((crumb, index) => (
              <span key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                {index > 0 ? <span aria-hidden="true">/</span> : null}
                {crumb.to ? (
                  <SiteLink to={crumb.to} className="hover:text-brand-navy hover:underline">
                    {crumb.label}
                  </SiteLink>
                ) : (
                  <span className="font-medium text-brand-charcoal">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : null}
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-3 max-w-3xl font-display text-3xl font-bold text-brand-charcoal sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
          {title}
        </h1>
        {description ? (
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-brand-slate">{description}</p>
        ) : null}
        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </header>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "navy",
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  tone?: "navy" | "gold" | "success" | "info";
}) {
  const toneRing: Record<string, string> = {
    navy: "border-brand-navy/15 bg-brand-navy/5 text-brand-navy",
    gold: "border-brand-gold/40 bg-brand-gold/10 text-brand-gold-dark",
    success: "border-success/25 bg-success/8 text-success",
    info: "border-info/25 bg-info/8 text-info",
  };
  return (
    <div className="rounded-lg border border-brand-border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-slate">
          {label}
        </p>
        {icon ? (
          <span className={cn("rounded-md border p-1.5", toneRing[tone])}>{icon}</span>
        ) : null}
      </div>
      <p className="mt-3 font-display text-3xl font-bold text-brand-charcoal">{value}</p>
      {hint ? <p className="mt-1 text-xs text-brand-slate">{hint}</p> : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: { label: string; to: string } | undefined;
  icon?: ReactNode | undefined;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-brand-border bg-white px-6 py-14 text-center">
      <span className="rounded-full border border-brand-border bg-brand-cream p-3 text-brand-slate">
        {icon ?? <Inbox className="h-6 w-6" />}
      </span>
      <h3 className="mt-4 font-display text-lg font-semibold text-brand-charcoal">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-brand-slate">{description}</p>
      {action ? (
        <SiteLink
          to={action.to}
          className="mt-5 inline-flex items-center gap-2 rounded-md bg-brand-navy px-4 py-2 text-sm font-semibold text-white hover:bg-brand-navy-light"
        >
          {action.label}
          <ArrowRight className="h-4 w-4" />
        </SiteLink>
      ) : null}
    </div>
  );
}

export function Skeleton({ className }: { className?: string | undefined }) {
  return <div className={cn("animate-pulse rounded-md bg-brand-slate/12", className)} />;
}

export function CardSkeleton({ lines = 3 }: { lines?: number | undefined }) {
  return (
    <div className="rounded-lg border border-brand-border bg-white p-5">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-6 w-3/4" />
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} className="mt-2 h-3 w-full" />
      ))}
    </div>
  );
}

function disclosureTone(tag: DisclosureTag): BadgeTone {
  if (tag === "Independent Editorial") return "success";
  if (tag === "Sponsored Research") return "warning";
  return "info";
}

export function DisclosureBadge({ tag }: { tag: DisclosureTag }) {
  return <Badge tone={disclosureTone(tag)}>{tag}</Badge>;
}

export function InfoNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "rounded-md border border-brand-border bg-brand-cream px-4 py-3 text-xs leading-relaxed text-brand-slate",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function KeyedList({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="divide-y divide-brand-border rounded-lg border border-brand-border bg-white">
      {items.map((item) => (
        <div key={item.label} className="grid gap-1 px-4 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
          <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-brand-slate">
            {item.label}
          </dt>
          <dd className="text-sm text-brand-charcoal">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
