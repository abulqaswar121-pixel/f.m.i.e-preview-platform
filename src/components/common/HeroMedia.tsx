import { cn } from "@/lib/utils";

/**
 * The homepage banner backdrop: one single, static brand cover photograph
 * (`public/media/hero-cover.webp` — the golden-hour container port). The hero
 * backdrop deliberately never moves; all motion on the homepage lives inside
 * the "F.M.I.E in 60 seconds" showcase card, which has real playback controls.
 */
export function HeroMedia({ className }: { className?: string }) {
  return (
    <img
      src="/media/hero-cover.webp"
      alt=""
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 h-full w-full object-cover", className)}
    />
  );
}

export default HeroMedia;
