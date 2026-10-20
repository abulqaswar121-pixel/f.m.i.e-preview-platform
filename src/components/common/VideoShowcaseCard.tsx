import { useEffect, useRef, useState } from "react";
import { BadgeCheck, Pause, Play, Volume2, VolumeX } from "lucide-react";

import { useDatabase } from "@/services/api";
import { cn } from "@/lib/utils";

function clock(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Fiverr-style standalone gig video card, brand-modern edition.
 *
 * The picture is never covered: no overlay bars, no native browser controls —
 * a glass control dock sits *below* the media with a custom play/pause button,
 * a slim gold progress rail (click to seek), the timecode and the mute toggle.
 * Media starts muted (browser autoplay rules) and loops; the shipped default
 * source is `public/media/showcase-film-v4.mp4` — a 65-second film whose clean,
 * non-overlapping scenes follow the voice-over line by line. With no video set,
 * the animated brand loop plays as picture with the voice-over underneath.
 */
export function VideoShowcaseCard({ className }: { className?: string }) {
  const database = useDatabase();
  const { showcaseVideoUrl, showcaseAudioUrl } = database.settings;
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  const hasVideo = showcaseVideoUrl.length > 0;
  const hasAudio = !hasVideo && showcaseAudioUrl.length > 0;

  useEffect(() => {
    const media = (hasVideo ? videoRef.current : audioRef.current) as
      HTMLVideoElement | HTMLAudioElement | null;
    if (!media) return;
    media.muted = muted;
  }, [muted, hasVideo, hasAudio]);

  function togglePlay(): void {
    const media = (hasVideo ? videoRef.current : audioRef.current) as
      HTMLVideoElement | HTMLAudioElement | null;
    if (!media) return;
    if (media.paused) {
      void media.play().catch(() => undefined);
      setPlaying(true);
    } else {
      media.pause();
      setPlaying(false);
    }
  }

  function toggleSound(): void {
    setMuted((current) => !current);
  }

  function seek(event: React.MouseEvent<HTMLDivElement>): void {
    const media = (hasVideo ? videoRef.current : audioRef.current) as
      HTMLVideoElement | HTMLAudioElement | null;
    const rail = railRef.current;
    if (!media || !rail || !media.duration) return;
    const rect = rail.getBoundingClientRect();
    const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    media.currentTime = ratio * media.duration;
  }

  return (
    <figure
      className={cn(
        "group relative rounded-3xl bg-gradient-to-br from-brand-gold/60 via-white/15 to-brand-navy/40 p-[1.5px] shadow-2xl shadow-brand-navy-dark/50 transition-transform duration-300 hover:-translate-y-1",
        className,
      )}
    >
      <div className="overflow-hidden rounded-[calc(1.5rem-1.5px)] bg-brand-navy-dark">
        {/* Glass header strip */}
        <div className="fmie-glass-dark flex items-center justify-between px-4 py-2.5">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-gold">
            <BadgeCheck className="h-3.5 w-3.5" /> F.M.I.E in 60 seconds
          </p>
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                playing ? "animate-pulse bg-brand-gold" : "bg-white/40",
              )}
            />
            {playing ? "Playing" : "Paused"}
          </p>
        </div>

        {/* Clean picture — nothing overlaps it */}
        {hasVideo ? (
          <video
            ref={videoRef}
            src={showcaseVideoUrl}
            autoPlay
            loop
            playsInline
            muted
            className="aspect-video w-full object-cover"
            onTimeUpdate={(event) => {
              setElapsed(event.currentTarget.currentTime);
              setDuration(event.currentTarget.duration || 0);
              setProgress(
                event.currentTarget.duration
                  ? (event.currentTarget.currentTime / event.currentTarget.duration) * 100
                  : 0,
              );
            }}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />
        ) : (
          <>
            <img
              src="/media/brand-loop.webp"
              alt=""
              aria-hidden="true"
              className={cn("aspect-video w-full object-cover", !playing && "opacity-60")}
            />
            {hasAudio ? (
              <audio
                ref={audioRef}
                src={showcaseAudioUrl}
                autoPlay
                loop
                muted
                playsInline
                onTimeUpdate={(event) => {
                  setElapsed(event.currentTarget.currentTime);
                  setDuration(event.currentTarget.duration || 0);
                  setProgress(
                    event.currentTarget.duration
                      ? (event.currentTarget.currentTime / event.currentTarget.duration) * 100
                      : 0,
                  );
                }}
              />
            ) : null}
          </>
        )}

        {/* Glass control dock — below the picture, never on top of it */}
        <div className="fmie-glass-dark flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "Pause" : "Play"}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gold text-brand-navy-dark shadow-lg shadow-brand-gold/30 transition-transform hover:scale-105"
          >
            {playing ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 translate-x-[1px]" />
            )}
          </button>
          <div
            ref={railRef}
            onClick={seek}
            role="slider"
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            className="relative h-1.5 flex-1 cursor-pointer rounded-full bg-white/15"
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-gold to-[#e8d9b0]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="shrink-0 font-mono text-[10px] text-white/70">
            {clock(elapsed)} / {clock(duration)}
          </span>
          <button
            type="button"
            onClick={toggleSound}
            aria-label={muted ? "Turn sound on" : "Mute"}
            aria-pressed={!muted}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur transition-colors hover:bg-brand-gold hover:text-brand-navy-dark"
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </figure>
  );
}

export default VideoShowcaseCard;
