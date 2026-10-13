import { cn } from "@/lib/utils";

/**
 * The official F.M.I.E mark, as SVG.
 *
 * 1. A top monogram: a serif F whose top horizontal arm turns down to bracket
 *    an overlapping capital M.
 * 2. Bold, punctuated serif capitals F.M.I.E beneath.
 *
 * Renders in the current colour, so it appears white on dark navy surfaces and
 * navy on light surfaces.
 */

export const MONOGRAM_PATHS = [
  // F — stem with base serif
  "M16 12h9v72H10v-5h6z",
  // F — top arm, turning down at the end to bracket the M
  "M16 12h74v14h-5V21H16z",
  // F — middle arm
  "M16 44h30v8H16z",
  // M — overlapping capital, sitting inside the bracket of the F arm
  "M48 84V26h9l12 34 12-34h9v58h-9V44L70 78h-2L57 44v40z",
] as const;

export function Monogram({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 106 96"
      className={cn("h-10 w-11", className)}
      role="img"
      aria-label={title ?? "F.M.I.E monogram"}
      fill="currentColor"
    >
      {MONOGRAM_PATHS.map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}

interface LogoProps {
  className?: string;
  /** `stacked` places the wordmark under the monogram; `horizontal` beside it. */
  variant?: "stacked" | "horizontal";
  /** `light` renders white on dark; `dark` renders navy on light. */
  tone?: "light" | "dark";
  showTagline?: boolean;
  compact?: boolean;
}

export function Logo({
  className,
  variant = "stacked",
  tone = "dark",
  showTagline = false,
  compact = false,
}: LogoProps) {
  const toneClass = tone === "light" ? "text-white" : "text-brand-navy";
  const taglineClass = tone === "light" ? "text-brand-gold" : "text-brand-gold-dark";

  if (variant === "horizontal") {
    return (
      <span className={cn("flex items-center gap-3", toneClass, className)}>
        <Monogram className={compact ? "h-8 w-9" : "h-11 w-12"} />
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display font-bold tracking-[0.14em]",
              compact ? "text-xl" : "text-2xl",
            )}
          >
            F.M.I.E
          </span>
          {showTagline ? (
            <span
              className={cn(
                "mt-1 text-[10px] font-semibold uppercase tracking-[0.22em]",
                taglineClass,
              )}
            >
              F.M.I.E Means Business
            </span>
          ) : null}
        </span>
      </span>
    );
  }

  return (
    <span className={cn("inline-flex flex-col items-center", toneClass, className)}>
      <Monogram className={compact ? "h-9 w-10" : "h-14 w-[3.9rem]"} />
      <span className="mt-1 h-[2px] w-full bg-brand-gold" aria-hidden="true" />
      <span
        className={cn(
          "mt-2 font-display font-bold tracking-[0.16em]",
          compact ? "text-lg" : "text-3xl",
        )}
      >
        F.M.I.E
      </span>
      {showTagline ? (
        <span
          className={cn("mt-1 text-[10px] font-semibold uppercase tracking-[0.24em]", taglineClass)}
        >
          F.M.I.E Means Business
        </span>
      ) : null}
    </span>
  );
}

export default Logo;
