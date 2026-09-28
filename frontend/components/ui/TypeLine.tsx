"use client";

import { useEffect, useState } from "react";

export type Segment = { text: string; accent?: boolean };

/**
 * Types a line character by character once `start` is true.
 * Before that (and without JS) the full line is rendered.
 */
export function TypeLine({
  segments,
  start,
  delay = 0,
  speed = 34,
  className = "",
}: {
  segments: Segment[];
  start: boolean;
  delay?: number;
  speed?: number;
  className?: string;
}) {
  const full = segments.map((s) => s.text).join("");
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!start) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let i = 0;
    let interval: ReturnType<typeof setInterval> | undefined;
    setCount(0);
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        i += 1;
        setCount(i);
        if (i >= full.length && interval) clearInterval(interval);
      }, speed);
    }, delay);
    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [start, delay, speed, full.length]);

  const visible = count ?? full.length;
  let used = 0;

  return (
    <p className={className} aria-label={full}>
      <span aria-hidden>
        {segments.map((seg, i) => {
          const take = Math.max(0, Math.min(seg.text.length, visible - used));
          used += seg.text.length;
          if (!take) return null;
          return (
            <span key={i} className={seg.accent ? "text-ember-text" : undefined}>
              {seg.text.slice(0, take)}
            </span>
          );
        })}
        <span className="ml-0.5 inline-block w-[0.6ch] animate-caret text-ember">▌</span>
      </span>
    </p>
  );
}
