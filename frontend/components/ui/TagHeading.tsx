"use client";

import { useSeen } from "./Reveal";
import { Bracket } from "./Bracket";

/** Section title written as a self-closing tag: <Sessions/>. Brackets slide in on view. */
export function TagHeading({
  name,
  eyebrow,
  tone = "light",
  id,
  level = 2,
  size = "lg",
}: {
  name: string;
  eyebrow?: string;
  tone?: "light" | "dark";
  id?: string;
  level?: 1 | 2;
  size?: "lg" | "xl";
}) {
  const H = level === 1 ? "h1" : "h2";
  const [ref, seen] = useSeen<HTMLDivElement>();
  const text = tone === "light" ? "text-ink" : "text-on-dark";
  const muted = tone === "light" ? "text-muted" : "text-on-dark-soft";
  const slide = "inline-block transition-[transform,translate,opacity] delay-300 duration-[1300ms] ease-soft";
  return (
    <div ref={ref} className={seen ? "in" : ""}>
      {eyebrow && <p className={`rise mb-4 font-mono text-sm tracking-wide ${muted}`}>{eyebrow}</p>}
      <H
        id={id}
        style={{ ["--d" as string]: "140ms" }}
        className={`rise font-display font-bold leading-[0.92] tracking-[-0.045em] ${text} ${
          size === "xl" ? "text-[clamp(3.2rem,11vw,9.5rem)]" : "text-[clamp(2.5rem,7vw,5.5rem)]"
        }`}
      >
        <span aria-hidden className={`${slide} mr-[0.05em] text-ember ${seen ? "" : "js-hide-l"}`}>
          <Bracket side="open" />
        </span>
        {name}
        <span aria-hidden className={`${slide} ml-[0.07em] text-ember ${seen ? "" : "js-hide-r"}`}>
          <Bracket side="close" />
        </span>
      </H>
    </div>
  );
}
