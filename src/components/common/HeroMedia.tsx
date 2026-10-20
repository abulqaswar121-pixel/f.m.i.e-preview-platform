import { useDatabase } from "@/services/api";
import { cn } from "@/lib/utils";

/**
 * The looping marketing banner. When the Super Admin configures a video URL
 * (Admin → Homepage video & settings) it plays on auto-repeat; otherwise the
 * shipped hero film loop (`public/media/hero-loop.webp` — port, energy and
 * skyline scenes with slow push-ins and cross-fades) plays in its place, so
 * the backdrop always moves and stays distinct from the showcase card.
 */
export function HeroMedia({ className }: { className?: string }) {
  const database = useDatabase();
  const videoUrl = database.settings.heroVideoUrl;

  if (videoUrl) {
    return (
      <video
        src={videoUrl}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        tabIndex={-1}
        className={cn("pointer-events-none absolute inset-0 h-full w-full object-cover", className)}
      />
    );
  }

  return (
    <img
      src="/media/hero-loop.webp"
      alt=""
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 h-full w-full object-cover", className)}
    />
  );
}

export default HeroMedia;
