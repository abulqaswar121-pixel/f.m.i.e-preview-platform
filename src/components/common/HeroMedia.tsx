import { useDatabase } from "@/services/api";
import { cn } from "@/lib/utils";

const MONTAGE = [
  "/media/hero-original.webp",
  "/media/hero-field.webp",
  "/media/newsroom-portrait.webp",
];

/**
 * The looping marketing banner. When the Super Admin configures a video URL
 * (Platform Settings → Homepage video) it plays on auto-repeat; otherwise a
 * cinematic cross-fade montage of the brand photography stands in so the
 * banner always loops like a film.
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
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <style>{`
        @keyframes fmie-montage {
          0% { opacity: 0; transform: scale(1.06); }
          6% { opacity: 1; }
          30% { opacity: 1; transform: scale(1); }
          38% { opacity: 0; transform: scale(1.02); }
          100% { opacity: 0; }
        }
      `}</style>
      {MONTAGE.map((src, index) => (
        <img
          key={src}
          src={src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-0"
          style={{ animation: `fmie-montage 18s linear ${index * 6}s infinite` }}
        />
      ))}
    </div>
  );
}

export default HeroMedia;
