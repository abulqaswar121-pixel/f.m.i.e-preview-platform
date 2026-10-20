import { useEffect, useRef, useState } from "react";
import { BadgeCheck, Volume2, VolumeX } from "lucide-react";

import { useDatabase } from "@/services/api";
import { cn } from "@/lib/utils";

/**
 * Fiverr-style standalone gig video card: a rounded, shadowed media card that
 * sits beside the hero value proposition — never a background layer.
 *
 * Markup: an HTML5 <video> with `autoPlay`, `loop`, `playsInline` and NO native
 * controls (the browser seek bar is deliberately hidden). Because browsers
 * block unmuted autoplay, the media starts muted and a custom floating
 * toggle (the JavaScript logic lives in `toggleSound`) lets the visitor switch
 * the audio on with one tap. When the Super Admin has not uploaded a video,
 * the shipped animated brand loop stands in as the picture while an optional
 * voice-over track plays underneath — same mute-first behaviour.
 */
export function VideoShowcaseCard({ className }: { className?: string }) {
  const database = useDatabase();
  const { showcaseVideoUrl, showcaseAudioUrl } = database.settings;
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted, showcaseVideoUrl, showcaseAudioUrl]);

  function toggleSound(): void {
    setMuted((current) => {
      const next = !current;
      // Browsers only allow the unmute as a direct user gesture — this is one.
      if (videoRef.current) {
        videoRef.current.muted = next;
        if (!next) void videoRef.current.play().catch(() => undefined);
      }
      if (audioRef.current) {
        audioRef.current.muted = next;
        if (!next) void audioRef.current.play().catch(() => undefined);
      }
      return next;
    });
  }

  const hasVideo = showcaseVideoUrl.length > 0;
  const hasAudio = showcaseAudioUrl.length > 0;

  return (
    <figure
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-brand-navy-dark shadow-2xl shadow-brand-navy-dark/40 ring-1 ring-white/15",
        className,
      )}
    >
      {/* Media layer — no native controls, muted autoplay, loops forever */}
      {hasVideo ? (
        <video
          ref={videoRef}
          src={showcaseVideoUrl}
          autoPlay
          loop
          playsInline
          muted
          className="aspect-video w-full object-cover"
        />
      ) : (
        <img
          src="/media/brand-loop.webp"
          alt=""
          aria-hidden="true"
          className="aspect-video w-full object-cover"
        />
      )}
      {hasVideo && hasAudio ? null : hasAudio ? (
        <audio ref={audioRef} src={showcaseAudioUrl} autoPlay loop muted playsInline />
      ) : null}

      {/* Floating custom sound toggle */}
      <button
        type="button"
        onClick={toggleSound}
        aria-label={muted ? "Turn sound on" : "Mute the video"}
        aria-pressed={!muted}
        className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-brand-navy-dark/70 text-white backdrop-blur transition-colors hover:bg-brand-gold hover:text-brand-navy-dark"
      >
        {muted ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
      </button>

      {/* Caption bar */}
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-navy-dark via-brand-navy-dark/85 to-transparent px-4 pb-3 pt-8 text-white">
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-gold">
          <BadgeCheck className="h-3.5 w-3.5" /> F.M.I.E in 60 seconds
        </p>
        <p className="mt-1 text-xs leading-relaxed text-white/85">
          {muted
            ? "Sound is off — tap the speaker icon to listen while you watch."
            : "Sound on — tap the speaker icon to mute."}
        </p>
      </figcaption>
    </figure>
  );
}

export default VideoShowcaseCard;
