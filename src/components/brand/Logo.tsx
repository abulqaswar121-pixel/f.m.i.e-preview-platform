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
const HORIZONTAL = { width: 895, height: 251 } as const;

interface LogoProps {
  className?: string;
  /** `stacked` places the wordmark under the monogram; `horizontal` beside it. */
  variant?: "stacked" | "horizontal";
  /** `light` renders cream on dark; `dark` renders navy on light. */
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
  const suffix = tone === "light" ? "dark" : "light";
  const src =
    variant === "horizontal"
      ? `/art/logo-horizontal-on-${suffix}.png`
      : `/art/logo-on-${suffix}.png`;
  const intrinsic = variant === "horizontal" ? HORIZONTAL : STACKED;
  const taglineClass = tone === "light" ? "text-brand-gold" : "text-brand-gold-dark";
  const sizeClass =
    variant === "horizontal"
      ? compact
        ? "h-10 w-auto sm:h-11"
        : "h-12 w-auto sm:h-14"
      : compact
        ? "h-14 w-auto"
        : "h-20 w-auto";

  return (
    <span
      className={cn(
        "inline-flex flex-col items-start",
        variant === "stacked" && "items-center",
        className,
      )}
    >
      <img
        src={src}
        alt="F.M.I.E — F.M.I.E Means Business"
        width={intrinsic.width}
        height={intrinsic.height}
        className={cn(sizeClass, "select-none object-contain")}
        draggable={false}
      />
      {variant === "stacked" ? (
        <span className="mt-2 h-[2px] w-full bg-brand-gold" aria-hidden="true" />
      ) : null}
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
