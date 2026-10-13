import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type BadgeTone =
  "navy" | "gold" | "cream" | "success" | "warning" | "danger" | "info" | "muted" | "outline";

const toneClasses: Record<BadgeTone, string> = {
  navy: "bg-brand-navy text-white",
  gold: "bg-brand-gold text-brand-navy-dark",
  cream: "bg-white text-brand-navy border border-brand-border",
  success: "bg-success/12 text-success border border-success/30",
  warning: "bg-warning/12 text-warning border border-warning/30",
  danger: "bg-danger/12 text-danger border border-danger/30",
  info: "bg-info/12 text-info border border-info/30",
  muted: "bg-brand-slate/10 text-brand-slate border border-brand-slate/20",
  outline: "border border-current bg-transparent",
};

interface BadgeProps {
  tone?: BadgeTone | undefined;
  children: ReactNode;
  className?: string | undefined;
  icon?: ReactNode | undefined;
  title?: string | undefined;
}

export function Badge({ tone = "cream", children, className, icon, title }: BadgeProps) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em]",
        toneClasses[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

export default Badge;
