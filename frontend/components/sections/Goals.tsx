"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { TagHeading } from "@/components/ui/TagHeading";
import { useSeen } from "@/components/ui/Reveal";
import { blades, GLYPH_VIEWBOX } from "@/components/logo/geometry";
import { HookButton } from "./HookButton";

type Final = "passed" | "running" | "queued";
type Status = "pending" | Final;

// Placeholder goals — replace with the club's real ones (keep 3–5 stages, in order).
const STAGES: { key: string; final: Final; title: string; body: string; out: string[]; note: string }[] = [
  {
    key: "learn",
    final: "passed",
    title: "Learn by building, not by watching.",
    body: "Every session ends with something running on your own laptop. Students teach students, hands-on, and nobody sits through slides-only lectures.",
    out: ["hands-on sessions", "taught by students"],
    note: "sessions running",
  },
  {
    key: "connect",
    final: "passed",
    title: "Nobody at SOU codes alone.",
    body: "A peer-learning culture where seniors pair with juniors and doubts get solved out loud instead of Googled in silence.",
    out: ["peer mentoring", "open doubt-solving"],
    note: "peer network online",
  },
  {
    key: "ship",
    final: "running",
    title: "Ship real projects as a team.",
    body: "From a whiteboard idea to a live URL: small squads, real code review, Git flow, and a demo day to show it off.",
    out: ["project squads", "code review", "demo day"],
    note: "first squads forming",
  },
  {
    key: "compete",
    final: "queued",
    title: "Hackathons and open source.",
    body: "Take CodeXLab teams to hackathons and land our first merged pull requests in real open-source projects.",
    out: ["hackathon teams", "first merged PRs"],
    note: "starts after ship",
  },
];

const SETTLE_MS = 1600; // a stage "runs" this long before it settles into its final status
const d = (ms: number) => ({ ["--d" as string]: `${ms}ms` }) as CSSProperties;

/**
 * Goals as a CI pipeline (grow.yml). Each goal is a stage that starts running when it scrolls
 * into view and settles into its status; an ember rail fills with scroll; on desktop a sticky
 * run log mirrors the stages. The last stage, deploy, waits for a runner: the visitor (the hook).
 */
export function Goals() {
  const n = STAGES.length;
  const [seen, setSeen] = useState<boolean[]>(() => Array(n + 1).fill(false));
  const [settled, setSettled] = useState<boolean[]>(() => Array(n).fill(false));
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const onSeen = useCallback((i: number) => {
    setSeen((s) => (s[i] ? s : s.map((v, j) => v || j === i)));
    if (i >= n) return;
    const wait = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : SETTLE_MS;
    timers.current.push(setTimeout(() => setSettled((s) => s.map((v, j) => v || j === i)), wait));
  }, [n]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const status = (i: number): Status => {
    const f = STAGES[i].final;
    if (!seen[i]) return "pending";
    if (f === "queued") return "queued";
    return settled[i] ? f : "running";
  };
  const passed = STAGES.filter((_, i) => status(i) === "passed").length;

  // The rail fills as the pipeline scrolls through the middle of the screen.
  const listRef = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 70%", "end 55%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 60, damping: 22, restDelta: 0.001 });

  // overflow-clip (not overflow-hidden) on the section: hidden would make it a scroll container and break the sticky run log.

  return (
    <section id="goals" aria-labelledby="goals-title" className="relative isolate overflow-clip bg-canvas pb-32 pt-28 md:pb-44 md:pt-40">
      <div aria-hidden className="code-grid absolute inset-0 -z-10 opacity-70" />

      <div className="mx-auto max-w-[1200px] px-5 md:px-10">
        <TagHeading id="goals-title" name="Goals" eyebrow="// what we're compiling toward" size="xl" />
        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <p className="max-w-[32ch] text-[clamp(1.25rem,2.2vw,1.75rem)] leading-snug text-body">
            A club is only as good as what its members can build after they leave the room. So we wrote our goals like code:{" "}
            <span className="text-ink">a pipeline where every stage has to pass before the next one runs.</span>
          </p>
          <p className="font-mono text-sm leading-relaxed text-muted lg:text-right">
            {/* each "n label ·" stays whole; the space after it sits outside the nowrap span, so lines break only there */}
            {["// grow.yml", `${n + 1} stages`, ...(["passed", "running", "queued"] as const).map((f) => `${STAGES.filter((s) => s.final === f).length} ${f}`)].map(
              (t) => (
                <span key={t}>
                  <span className="whitespace-nowrap">{t} ·</span>{" "}
                </span>
              ),
            )}
            <span className="whitespace-nowrap text-ember-text">1 waiting on you</span>
          </p>
        </div>

        <div className="mt-20 grid gap-16 md:mt-28 lg:grid-cols-[minmax(0,1fr)_384px] lg:gap-20">
          <div>
            <ol ref={listRef} className="relative">
              {/* rail: hairline track + ember fill (a scaleY transform) */}
              <span aria-hidden className="absolute bottom-0 left-[21px] top-[22px] w-[2px] -translate-x-1/2 bg-hairline md:left-[27px]" />
              <motion.span
                aria-hidden
                className="absolute bottom-0 left-[21px] top-[22px] w-[2px] -translate-x-1/2 origin-top bg-ember md:left-[27px]"
                style={{ scaleY: reduce ? 1 : fill }}
              />
              {STAGES.map((s, i) => (
                <Stage key={s.key} index={i} stage={s} status={status(i)} onSeen={onSeen} />
              ))}
            </ol>
            <Deploy index={n} onSeen={onSeen} />
          </div>

          <RunLog seen={seen} status={status} passed={passed} />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ pieces */

function useStageSeen<T extends HTMLElement>(index: number, onSeen: (i: number) => void) {
  const [ref, seen] = useSeen<T>("0px 0px -28% 0px");
  useEffect(() => {
    if (seen) onSeen(index);
  }, [seen, index, onSeen]);
  return [ref, seen] as const;
}

function Stage({
  index,
  stage,
  status,
  onSeen,
}: {
  index: number;
  stage: (typeof STAGES)[number];
  status: Status;
  onSeen: (i: number) => void;
}) {
  const [ref, seen] = useStageSeen<HTMLLIElement>(index, onSeen);
  return (
    <li
      ref={ref}
      className={`relative grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-5 pb-20 md:grid-cols-[3.5rem_minmax(0,1fr)] md:gap-x-8 md:pb-28 ${seen ? "in" : ""}`}
    >
      <Node status={status} />
      <div className="pt-1.5 md:pt-3">
        <div className="rise flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[13px] text-muted">
          <span>stage {String(index + 1).padStart(2, "0")}</span>
          <span aria-hidden>·</span>
          <span className="text-ink">{stage.key}</span>
          <Badge status={status} />
        </div>
        <h3 className="rise mt-5 max-w-[20ch] font-display text-[clamp(1.9rem,4.4vw,3.6rem)] font-bold leading-[1] tracking-[-0.04em] text-ink" style={d(140)}>
          {stage.title}
        </h3>
        <p className="rise mt-6 max-w-[48ch] text-lg leading-relaxed text-body md:text-xl" style={d(280)}>
          {stage.body}
        </p>
        <ul className="rise mt-7 flex flex-wrap gap-2.5" style={d(420)}>
          {stage.out.map((o) => (
            <li key={o} className="rounded-full border border-hairline bg-surface-card px-3.5 py-1.5 font-mono text-[13px] text-body">
              <span className="text-ember-text">→</span> {o}
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

function Node({ status }: { status: Status }) {
  const tone =
    status === "passed" ? "border-ink bg-ink" : status === "running" ? "border-ember bg-canvas" : "border-hairline bg-canvas";
  return (
    <span aria-hidden className={`relative z-10 grid h-11 w-11 place-items-center rounded-full border-2 transition-colors duration-700 md:h-14 md:w-14 ${tone}`}>
      <svg viewBox="0 0 24 24" className="absolute h-5 w-5 md:h-6 md:w-6" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* check draws in once passed */}
        <path
          d="M5 12.5l4.5 4.5L19 7.5"
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={status === "passed" ? 0 : 1}
          stroke="var(--color-terminal)"
          strokeWidth={2.6}
          style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.22,1,0.36,1) 0.2s" }}
        />
      </svg>
      {status === "running" && (
        <svg viewBox="0 0 24 24" className="absolute h-7 w-7 animate-spin [animation-duration:1.8s] md:h-8 md:w-8" fill="none">
          <path d="M12 3a9 9 0 0 1 9 9" stroke="var(--color-ember)" strokeWidth={2.4} strokeLinecap="round" />
        </svg>
      )}
      {(status === "pending" || status === "queued") && <span className="h-2 w-2 rounded-full bg-muted-soft" />}
    </span>
  );
}

function Badge({ status }: { status: Status | "waiting" }) {
  if (status === "pending") return null;
  const map = {
    passed: { cls: "bg-ink text-canvas", icon: <span className="text-terminal">✔</span>, label: "passed" },
    running: {
      cls: "border border-ember/40 text-ember-text",
      icon: <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ember" />,
      label: "running",
    },
    queued: { cls: "border border-hairline text-muted", icon: <span>○</span>, label: "queued" },
    waiting: {
      cls: "bg-ember text-canvas",
      icon: <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-canvas" />,
      label: "waiting for a runner",
    },
  }[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs transition-colors duration-500 ${map.cls}`}>
      {map.icon}
      <span className="sr-only">status: </span>
      {map.label}
    </span>
  );
}

function Deploy({ index, onSeen }: { index: number; onSeen: (i: number) => void }) {
  const [ref, seen] = useStageSeen<HTMLDivElement>(index, onSeen);
  return (
    <div
      ref={ref}
      className={`relative grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-5 md:grid-cols-[3.5rem_minmax(0,1fr)] md:gap-x-8 ${seen ? "in" : ""}`}
    >
      {/* the final node is the club's X, waiting */}
      <span aria-hidden className="relative z-10 grid h-11 w-11 place-items-center rounded-full bg-ember md:h-14 md:w-14">
        <span className="absolute inset-0 animate-ping rounded-full bg-ember/30 [animation-duration:2.4s]" />
        <svg viewBox={GLYPH_VIEWBOX} className="relative h-5 w-5 md:h-6 md:w-6">
          {[blades.tl, blades.bl, blades.tr, blades.br].map((b, i) => (
            <path key={i} d={b} fill="var(--color-canvas)" />
          ))}
        </svg>
      </span>
      <div className="pt-1.5 md:pt-3">
        <div className="rise flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[13px] text-muted">
          <span>stage {String(index + 1).padStart(2, "0")}</span>
          <span aria-hidden>·</span>
          <span className="text-ink">deploy</span>
          <Badge status="waiting" />
        </div>
        <p className="rise mt-5 max-w-[16ch] font-display text-[clamp(2.4rem,6vw,5rem)] font-bold leading-[0.95] tracking-[-0.045em] text-ink" style={d(140)}>
          Wanna see it for yourself?
        </p>
        <p className="rise mt-6 max-w-[46ch] text-lg leading-relaxed text-body md:text-xl" style={d(280)}>
          Every pipeline needs a runner. Have a look, join the club or sit in on a session. The next stage starts when you do.
        </p>
        {/* md+: pull the hook left by its hidden "<" (0.48em at text-4xl) + gap-3, so the pill lines up with the text.
            phones: break out of the stage indent (2.75rem node + gap-x-5) so the command fits as a full-width CTA. */}
        <div className="rise mt-10 max-md:-ml-16 max-md:w-[calc(100%+4rem)] md:-ml-[calc(2.25rem*0.48+0.75rem)] md:mt-12" style={d(420)}>
          <HookButton />
        </div>
      </div>
    </div>
  );
}

function RunLog({ seen, status, passed }: { seen: boolean[]; status: (i: number) => Status; passed: number }) {
  const total = STAGES.length + 1;
  const icon = { pending: "·", passed: "✔", running: "◌", queued: "○" } as const;
  const tint = { pending: "text-on-dark-soft", passed: "text-terminal", running: "text-ember", queued: "text-on-dark-soft" } as const;
  return (
    <aside aria-hidden className="hidden lg:block">
      <div className="sticky top-32 overflow-hidden rounded-2xl border border-dark-hairline bg-dark text-on-dark shadow-[0_30px_80px_-40px_rgb(26_25_23/0.55)]">
        <div className="flex items-center gap-2 border-b border-dark-hairline px-5 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-ember" />
          <span className="h-2.5 w-2.5 rounded-full bg-on-dark-soft/40" />
          <span className="h-2.5 w-2.5 rounded-full bg-terminal/70" />
          <span className="ml-2 font-mono text-xs text-on-dark-soft">codexlab: ~/goals</span>
        </div>
        <div className="space-y-3 px-5 py-5 font-mono text-[13px] leading-relaxed">
          <p className="text-on-dark-soft">
            <span className="text-ember">$</span> codexlab run grow.yml
          </p>
          {STAGES.map((s, i) => {
            const st = status(i);
            return (
              <div
                key={s.key}
                className="grid grid-cols-[1.25rem_5rem_1fr] transition-opacity duration-700"
                style={{ opacity: seen[i] ? 1 : 0.28 }}
              >
                <span className={tint[st]}>{st === "running" ? <span className="inline-block animate-spin [animation-duration:1.8s]">◌</span> : icon[st]}</span>
                <span className="text-on-dark">{s.key}</span>
                <span className="text-on-dark-soft">{st === "pending" ? "waiting" : st === "running" ? `running · ${s.note}` : `${st} · ${s.note}`}</span>
              </div>
            );
          })}
          <div className="grid grid-cols-[1.25rem_5rem_1fr] transition-opacity duration-700" style={{ opacity: seen[STAGES.length] ? 1 : 0.28 }}>
            <span className="text-ember">⧗</span>
            <span className="text-on-dark">deploy</span>
            <span className="text-on-dark-soft">
              needs a runner: <span className="text-ember">you</span>
              <span className="ml-0.5 animate-caret text-ember">▌</span>
            </span>
          </div>
        </div>
        <div className="border-t border-dark-hairline px-5 py-4">
          <div className="flex justify-between font-mono text-xs text-on-dark-soft">
            <span>progress</span>
            <span>
              {passed}/{total} stages
            </span>
          </div>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-dark-soft">
            <div
              className="h-full origin-left rounded-full bg-ember transition-transform duration-[1200ms] ease-soft"
              style={{ transform: `scaleX(${passed / total})` }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
