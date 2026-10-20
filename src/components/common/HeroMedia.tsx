import { useDatabase } from "@/services/api";
import { cn } from "@/lib/utils";

/**
 * The looping marketing banner. When the Super Admin configures a video URL
 * (Admin → Homepage video & settings) it plays on auto-repeat; otherwise the
 * shipped brand film loop (`public/media/brand-loop.webp`, a 10-second animated
 * loop of the brand photography) plays in its place so the banner always
 * moves like a film.
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
      src="/media/brand-loop.webp"
      alt=""
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 h-full w-full object-cover", className)}
    />
  );
}

export default HeroMedia;
