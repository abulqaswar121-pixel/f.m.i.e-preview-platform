import { cn } from "@/lib/utils";

/**
 * The official F.M.I.E mark.
 *
 * The brand asset is the client-supplied artwork committed at
 * `public/art/logo-source.jpg` (monogram: a serif F whose top arm brackets an
 * overlapping capital M, above the punctuated serif capitals F.M.I.E). The
 * transparent lockups used here are derived from that asset without
 * redrawing it:
 *
 *   logo-on-{dark,light}.png            stacked lockup, cream or navy ink
 *   logo-horizontal-on-{dark,light}.png monogram + wordmark side by side
 *   logo-square.png                     512px square on brand navy (OG/apple)
 *
 * `tone="light"` places cream ink on dark navy surfaces; `tone="dark"` places
 * navy ink on light surfaces.
 */

const STACKED = { width: 664, height: 464 } as const;

interface LogoProps {
  className?: string;
  /** `light` renders cream on dark; `dark` renders navy on light. */
  tone?: "light" | "dark";
  showTagline?: boolean;
  compact?: boolean;
}

/**
 * The brand lockup exactly as supplied: monogram above, punctuated F.M.I.E
 * beneath. Never recomposed side-by-side.
 */
export function Logo({
  className,
  tone = "dark",
  showTagline = false,
  compact = false,
}: LogoProps) {
  const suffix = tone === "light" ? "dark" : "light";
  const taglineClass = tone === "light" ? "text-brand-gold" : "text-brand-gold-dark";
  const sizeClass = compact ? "h-9 w-auto sm:h-10" : "h-16 w-auto sm:h-20";

  return (
    <span className={cn("inline-flex flex-col items-center", className)}>
      <img
        src={`/art/logo-on-${suffix}.png`}
        alt="F.M.I.E — F.M.I.E Means Business"
        width={STACKED.width}
        height={STACKED.height}
        className={cn(sizeClass, "select-none object-contain")}
        draggable={false}
      />
      <span
        className={cn(compact ? "mt-1" : "mt-2", "h-[2px] w-full bg-brand-gold")}
        aria-hidden="true"
      />
      {showTagline ? (
        <span
          className={cn("mt-2 text-[10px] font-semibold uppercase tracking-[0.24em]", taglineClass)}
        >
          F.M.I.E Means Business
        </span>
      ) : null}
    </span>
  );
}

export default Logo;
