import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface TypewriterProps {
  /** Lines typed out, held, wiped back and retyped in a continuous loop. */
  phrases: string[];
  className?: string;
  /** Milliseconds per character while typing. */
  typeMs?: number;
  /** Milliseconds per character while wiping back. */
  deleteMs?: number;
  /** Milliseconds the finished line stays on screen before wiping. */
  holdMs?: number;
  /** Milliseconds of darkness between lines. */
  gapMs?: number;
}

const TYPE_MS = 55;
const DELETE_MS = 26;
const HOLD_MS = 1900;
const GAP_MS = 420;

/**
 * Typewriter headline: types a line character by character, holds it, wipes it
 * back to nothing and types the next line, looping forever. Honours
 * `prefers-reduced-motion` by showing the first line statically.
 */
export function Typewriter({
  phrases,
  className,
  typeMs = TYPE_MS,
  deleteMs = DELETE_MS,
  holdMs = HOLD_MS,
  gapMs = GAP_MS,
}: TypewriterProps) {
  const [text, setText] = useState("");
  const [reduced, setReduced] = useState(false);
  const state = useRef({
    index: 0,
    length: 0,
    phase: "type" as "type" | "hold" | "delete" | "gap",
  });

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reduced || phrases.length === 0) return;
    let timer: number;

    const tick = () => {
      const s = state.current;
      const phrase = phrases[s.index] ?? "";
      if (s.phase === "type") {
        s.length += 1;
        setText(phrase.slice(0, s.length));
        if (s.length >= phrase.length) {
          s.phase = "hold";
          timer = window.setTimeout(tick, holdMs);
        } else {
          timer = window.setTimeout(tick, typeMs);
        }
      } else if (s.phase === "hold") {
        s.phase = "delete";
        timer = window.setTimeout(tick, deleteMs);
      } else if (s.phase === "delete") {
        s.length -= 1;
        setText(phrase.slice(0, Math.max(s.length, 0)));
        if (s.length <= 0) {
          s.phase = "gap";
          timer = window.setTimeout(tick, gapMs);
        } else {
          timer = window.setTimeout(tick, deleteMs);
        }
      } else {
        s.index = (s.index + 1) % phrases.length;
        s.length = 0;
        s.phase = "type";
        setText("");
        timer = window.setTimeout(tick, typeMs);
      }
    };

    timer = window.setTimeout(tick, gapMs);
    return () => window.clearTimeout(timer);
  }, [reduced, phrases, typeMs, deleteMs, holdMs, gapMs]);

  return (
    <span className={cn("inline", className)}>
      {reduced ? (phrases[0] ?? "") : text}
      <span
        aria-hidden="true"
        className={cn(
          "ml-1 inline-block h-[0.9em] w-[3px] translate-y-[0.12em] bg-brand-gold",
          reduced ? "opacity-0" : "animate-pulse",
        )}
      />
    </span>
  );
}

export default Typewriter;
