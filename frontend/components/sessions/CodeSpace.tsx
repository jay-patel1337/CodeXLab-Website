"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { braces, BRACE_W } from "@/components/logo/geometry";
import { Bracket } from "@/components/ui/Bracket";

export type Commit = { hash: string; label: string };

/**
 * The Sessions "code space": CSS-3D objects living in the dark band's side space.
 * Everything is driven by the section's scroll progress (transforms + opacity only), so objects
 * fly in from depth and assemble slowly as you scroll. Decorative (aria-hidden); the large objects
 * have one calm hover each (pointer only), everything else ignores the pointer.
 * - Large objects (cube, terminal, extruded braces, binary cylinder) render from xl, where there's side space.
 * - The grid floor and syntax particles render everywhere at low intensity.
 * - Reduced motion: frozen at a composed mid-point.
 */
export function CodeSpace({ commits }: { commits: Commit[] }) {
  const root = useRef<HTMLDivElement>(null);
  const space = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const resting = useRestingHeight(root);
  const { scrollYProgress } = useScroll({ target: space, offset: ["start end", "end start"] });
  const frozen = useMotionValue(0.55);
  const p = reduce ? frozen : scrollYProgress;

  return (
    // overflow-anchor: none. Decoration must never be the browser's scroll anchor: these layers sit at
    // percentages of the section, so when a session row opened, an anchored token "moved" and the
    // browser scrolled the whole page after it (the clicked row flew ~1300px).
    <div ref={root} aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden [overflow-anchor:none]">
      <Floor />
      {/* The objects live in a band with the section's resting height (every session row closed), so
          opening a row never slides them or changes their scroll progress. */}
      <div ref={space} className="absolute inset-x-0 top-0" style={{ height: resting ?? "100%" }}>
        <Particles p={p} />
        <div className="hidden xl:block">
          <CodeCube p={p} />
          <TerminalSlab p={p} commits={commits} />
          <ExtrudedBraces p={p} />
          <BinaryCylinder p={p} />
        </div>
      </div>
    </div>
  );
}

/** The section's height with every session row closed: its current height minus the open row bodies. */
function useRestingHeight(ref: RefObject<HTMLElement | null>) {
  const [h, setH] = useState<number | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      let open = 0;
      el.parentElement?.querySelectorAll<HTMLElement>("[data-session-body]").forEach((b) => (open += b.getBoundingClientRect().height));
      setH(Math.round(el.getBoundingClientRect().height - open)); // same number every frame of an expand: no re-render
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return h;
}

/* ------------------------------------------------------------------ helpers */

/**
 * Fade + fly in from depth over a window of scroll progress.
 * Always ends at opacity 1: a 3D group below full opacity is re-rendered off-screen every frame.
 * (Tone comes from each object's own colours instead.)
 */
function useAppear(p: MotionValue<number>, start: number, span = 0.16) {
  const opacity = useTransform(p, [start, start + span], [0, 1]);
  const z = useTransform(p, [start, start + span * 1.4], [-420, 0]);
  return { opacity, z };
}

/**
 * Hover from the object's untransformed outer box (a stable hit area, so the pose change never
 * makes it flicker). The pose itself is a CSS transition on a wrapper: transform only.
 */
function useHover() {
  const [on, setOn] = useState(false);
  return [on, { onPointerEnter: () => setOn(true), onPointerLeave: () => setOn(false) }] as const;
}
const SOFT = "transform 1s cubic-bezier(0.22, 1, 0.36, 1)";

function Pose({ on, hover, children }: { on: boolean; hover: string; children: ReactNode }) {
  return (
    <>
      <div
        className="pointer-events-none absolute -inset-12 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--color-ember)_20%,transparent),transparent)] transition-opacity duration-700"
        style={{ opacity: on ? 1 : 0 }}
      />
      <div className="relative h-full w-full" style={{ transformStyle: "preserve-3d", transform: on ? hover : "none", transition: SOFT }}>
        {children}
      </div>
    </>
  );
}

const leftGutter = (w: number): CSSProperties => ({ left: `max(-70px, calc(50% - 560px - ${w + 40}px))` });
const rightGutter = (w: number): CSSProperties => ({ right: `max(-70px, calc(50% - 560px - ${w + 40}px))` });

/* ------------------------------------------------------------------ cube */

const CUBE_FACES: { t: string; body: ReactNode }[] = [
  {
    t: "rotateY(0deg)",
    body: (
      <>
        <span className="text-ember">const</span> club = {"{"}
        <br />
        &nbsp;&nbsp;name: <span className="text-terminal">&quot;CodeXLab&quot;</span>,
        <br />
        &nbsp;&nbsp;mode: <span className="text-terminal">&quot;SOU&quot;</span>,
        <br />
        &nbsp;&nbsp;sessions: [],
        <br />
        {"};"}
      </>
    ),
  },
  {
    t: "rotateY(90deg)",
    body: (
      <>
        <span className="text-ember">for</span> (s <span className="text-ember">of</span> sessions)
        <br />
        &nbsp;&nbsp;learn(s);
        <br />
        <br />
        <span className="text-on-dark-soft/60">{"// then ship"}</span>
      </>
    ),
  },
  {
    t: "rotateY(180deg)",
    body: (
      <>
        $ git commit -m
        <br />
        <span className="text-terminal">&quot;session++&quot;</span>
        <br />
        <br />[main a3f9c2]
      </>
    ),
  },
  {
    t: "rotateY(-90deg)",
    body: (
      <>
        $ npm run build
        <br />
        <span className="text-terminal">✔ compiled</span>
        <br />
        <span className="text-terminal">✔ 0 errors</span>
      </>
    ),
  },
  { t: "rotateX(90deg)", body: <span className="grid h-full place-items-center font-display text-5xl text-ember">{"{ }"}</span> },
  { t: "rotateX(-90deg)", body: (
      <span className="grid h-full place-items-center text-5xl text-ember">
        <span className="flex items-center">
          <Bracket side="open" weight={13} />
          <Bracket side="close" weight={13} />
        </span>
      </span>
    ),
  },
];

function CodeCube({ p }: { p: MotionValue<number> }) {
  const size = 190;
  const { opacity, z } = useAppear(p, 0.04, 0.16);
  const rotateX = useTransform(p, [0, 1], [26, 210]);
  const rotateY = useTransform(p, [0, 1], [-38, 330]);
  const y = useTransform(p, [0, 1], [120, -180]);
  const [on, hover] = useHover();
  return (
    <motion.div className="pointer-events-auto absolute top-[7%]" style={{ ...leftGutter(size), width: size, height: size, perspective: 900, opacity, y, willChange: "transform, opacity" }} {...hover}>
      {/* hover: a quarter turn to the next face, drifting toward you */}
      <Pose on={on} hover="translateZ(50px) rotateY(90deg) rotateX(-8deg)">
        <motion.div className="relative h-full w-full" style={{ transformStyle: "preserve-3d", rotateX, rotateY, z, willChange: "transform" }}>
          {CUBE_FACES.map((f, i) => (
            <div
              key={i}
              className={`absolute inset-0 overflow-hidden rounded-xl border bg-dark-elevated/90 p-4 font-mono text-[11px] leading-[1.6] text-on-dark-soft transition-colors duration-700 ${on ? "border-ember/80" : "border-ember/35"}`}
              style={{ transform: `${f.t} translateZ(${size / 2}px)`, backfaceVisibility: "hidden" }}
            >
              {f.body}
            </div>
          ))}
        </motion.div>
      </Pose>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ terminal */

function TermLine({ p, at, children }: { p: MotionValue<number>; at: number; children: ReactNode }) {
  const opacity = useTransform(p, [at, at + 0.025], [0, 1]);
  const x = useTransform(p, [at, at + 0.025], [-8, 0]);
  return (
    <motion.div className="truncate" style={{ opacity, x }}>
      {children}
    </motion.div>
  );
}

function TerminalSlab({ p, commits }: { p: MotionValue<number>; commits: Commit[] }) {
  const w = 340;
  const { opacity, z } = useAppear(p, 0.08, 0.16);
  const rotateY = useTransform(p, [0, 1], [-40, -14]);
  const rotateX = useTransform(p, [0, 1], [14, 2]);
  const y = useTransform(p, [0, 1], [160, -220]);
  const start = 0.14;
  const [on, hover] = useHover();
  const lines: ReactNode[] = [
    <>
      <span className="text-ember">$</span> git log --oneline
    </>,
    ...commits.slice(0, 5).map((c, i) => (
      <>
        <span className="text-ember">*</span> <span className="text-ember/80">{c.hash}</span> {i === 0 && <span className="text-terminal">(HEAD) </span>}
        <span className="text-on-dark">{c.label}</span>
      </>
    )),
    <>
      <span className="text-ember">$</span> ./next-session --soon
    </>,
    <span className="text-terminal">✔ compiling ideas…</span>,
  ];
  return (
    <motion.div className="pointer-events-auto absolute top-[15%]" style={{ ...rightGutter(w), width: w, perspective: 1100, opacity, y, willChange: "transform, opacity" }} {...hover}>
      {/* hover: turns to face you and answers */}
      <Pose on={on} hover="translateZ(46px) rotateY(20deg) rotateX(-4deg)">
      <motion.div className="relative" style={{ transformStyle: "preserve-3d", rotateY, rotateX, z, willChange: "transform" }}>
        {/* back plates fake the slab's thickness */}
        <div className="absolute inset-0 rounded-xl bg-dark-soft" style={{ transform: "translateZ(-26px)" }} />
        <div className="absolute inset-0 rounded-xl border border-dark-hairline bg-dark" style={{ transform: "translateZ(-13px)" }} />
        <div className="relative overflow-hidden rounded-xl border border-dark-hairline bg-dark-elevated/95">
          <div className="flex items-center gap-2 border-b border-dark-hairline px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-ember" />
            <span className="h-2.5 w-2.5 rounded-full bg-on-dark-soft/40" />
            <span className="h-2.5 w-2.5 rounded-full bg-terminal/70" />
            <span className="ml-2 font-mono text-[11px] text-on-dark-soft">codexlab: ~/sessions</span>
          </div>
          <div className="space-y-1.5 px-4 py-4 font-mono text-[12px] leading-relaxed text-on-dark-soft">
            {lines.map((l, i) => (
              <TermLine key={i} p={p} at={start + i * 0.028}>
                {l}
              </TermLine>
            ))}
            <div className="truncate transition-opacity duration-700" style={{ opacity: on ? 1 : 0 }}>
              <span className="text-ember">$</span> whoami <span className="text-on-dark">→ next contributor</span>
              <span className="ml-1 animate-caret text-ember">▌</span>
            </div>
          </div>
        </div>
      </motion.div>
      </Pose>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ extruded braces */

function ExtrudedBraces({ p }: { p: MotionValue<number> }) {
  const w = 230;
  const layers = 11;
  const { opacity, z } = useAppear(p, 0.26, 0.16);
  const rotateY = useTransform(p, [0, 1], [-62, 48]);
  const rotateX = useTransform(p, [0, 1], [18, -14]);
  const y = useTransform(p, [0, 1], [140, -160]);
  const [on, hover] = useHover();
  return (
    <motion.div className="pointer-events-auto absolute top-[42%]" style={{ ...leftGutter(w), width: w, height: w, perspective: 900, opacity, y, willChange: "transform, opacity" }} {...hover}>
      {/* hover: the extrusion pulls apart into its layers */}
      <Pose on={on} hover="translateZ(36px) rotateY(-16deg)">
      <motion.div className="relative h-full w-full" style={{ transformStyle: "preserve-3d", rotateY, rotateX, z, willChange: "transform" }}>
        {Array.from({ length: layers }, (_, i) => {
          const k = i / (layers - 1); // 0 = front face
          const left = i === 0 ? "var(--color-on-dark)" : `color-mix(in oklab, var(--color-on-dark-soft) ${Math.round(70 - k * 55)}%, var(--color-dark))`;
          const right = i === 0 ? "var(--color-ember)" : `color-mix(in oklab, var(--color-ember) ${Math.round(72 - k * 52)}%, var(--color-dark))`;
          return (
            <svg
              key={i}
              viewBox="45.5 41.5 29 27"
              className="absolute inset-0 h-full w-full overflow-visible"
              style={{ transform: `translateZ(${-i * (on ? 7 : 3.4)}px)`, transition: SOFT }}
            >
              <g fill="none" strokeWidth={BRACE_W} strokeLinecap="round" strokeLinejoin="round">
                <path d={braces.left} stroke={left} />
                <path d={braces.right} stroke={right} />
              </g>
            </svg>
          );
        })}
      </motion.div>
      </Pose>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ binary cylinder */

// Deterministic bits (same on server and client).
function bits(seed: number, n: number) {
  let s = seed;
  return Array.from({ length: n }, () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s & 1;
  });
}

function BinaryCylinder({ p }: { p: MotionValue<number> }) {
  const cols = 20;
  const rows = 11;
  const radius = 118;
  const { opacity, z } = useAppear(p, 0.34, 0.16);
  const rotateY = useTransform(p, [0, 1], [-40, 440]);
  const y = useTransform(p, [0, 1], [120, -200]);
  const [on, hover] = useHover();
  return (
    <motion.div className="pointer-events-auto absolute top-[60%]" style={{ ...rightGutter(260), width: 260, height: 300, perspective: 1000, opacity, y, willChange: "transform, opacity" }} {...hover}>
      {/* hover: the cylinder opens up and turns a little */}
      <Pose on={on} hover="translateZ(24px) rotateY(40deg)">
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d", rotateX: -14, rotateY, z, willChange: "transform" }}
      >
        {Array.from({ length: cols }, (_, c) => (
          <div
            key={c}
            className="absolute left-1/2 top-0 flex w-4 -translate-x-1/2 flex-col items-center font-mono text-[13px] leading-[1.55]"
            style={{ transform: `rotateY(${(c * 360) / cols}deg) translateZ(${on ? radius + 22 : radius}px)`, transition: SOFT }}
          >
            {bits(c * 7919 + 17, rows).map((b, r) => (
              <span key={r} className={(c + r) % 7 === 0 ? "text-ember/85" : b ? "text-on-dark-soft/80" : "text-on-dark-soft/30"}>
                {b}
              </span>
            ))}
          </div>
        ))}
      </motion.div>
      </Pose>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ particles */

const TOKENS: { t: string; x: string; y: string; d: number; ember?: boolean }[] = [
  { t: "=>", x: "4%", y: "30%", d: 0.9, ember: true },
  { t: "&&", x: "11%", y: "58%", d: 0.35 },
  { t: "[ ]", x: "7%", y: "76%", d: 0.6 },
  { t: "λ", x: "2.5%", y: "88%", d: 0.8, ember: true },
  { t: "!==", x: "13%", y: "20%", d: 0.3 },
  { t: "0x1F", x: "90%", y: "10%", d: 0.45 },
  { t: "();", x: "94%", y: "40%", d: 0.85, ember: true },
  { t: "++", x: "87%", y: "52%", d: 0.3 },
  { t: "<X/>", x: "92%", y: "86%", d: 0.95, ember: true },
  { t: "::", x: "85%", y: "72%", d: 0.4 },
  { t: "??", x: "18%", y: "94%", d: 0.25 },
  { t: "#", x: "82%", y: "96%", d: 0.55 },
];

/**
 * Tokens are grouped into three depth layers (far / mid / near). Each layer moves as one
 * composited element, so scrolling costs 3 style writes instead of one per token.
 */
const LAYERS = [
  { max: 0.4, speed: 90, fade: 0.1 },
  { max: 0.7, speed: 170, fade: 0.14 },
  { max: 1, speed: 260, fade: 0.18 },
] as const;

function ParticleLayer({ p, depth }: { p: MotionValue<number>; depth: 0 | 1 | 2 }) {
  const L = LAYERS[depth];
  const y = useTransform(p, [0, 1], [L.speed, -L.speed]);
  const opacity = useTransform(p, [L.fade, L.fade + 0.16], [0, 1]);
  const toks = TOKENS.filter((t) => (t.d < L.max && t.d >= (depth === 0 ? 0 : LAYERS[depth - 1].max)));
  return (
    <motion.div className="absolute inset-0" style={{ y, opacity, willChange: "transform, opacity" }}>
      {toks.map((tok) => (
        <span
          key={tok.t}
          className={`absolute font-mono font-medium ${tok.ember ? "text-ember" : "text-on-dark-soft"}`}
          style={{ left: tok.x, top: tok.y, fontSize: 13 + tok.d * 30, opacity: 0.2 + tok.d * 0.5, rotate: `${(tok.d - 0.5) * 24}deg` }}
        >
          {tok.t}
        </span>
      ))}
    </motion.div>
  );
}

function Particles({ p }: { p: MotionValue<number> }) {
  return (
    <div className="absolute inset-0 hidden md:block">
      <ParticleLayer p={p} depth={0} />
      <ParticleLayer p={p} depth={1} />
      <ParticleLayer p={p} depth={2} />
    </div>
  );
}

/* ------------------------------------------------------------------ grid floor */

// A small git graph drawn on the floor plane (plane units: 1000 × 1000).
const GRAPH = [
  "M500 1000 V120",
  "M500 820 C500 760 360 760 360 700 V420 C360 360 500 360 500 300",
  "M500 640 C500 580 660 580 660 520 V260 C660 200 500 200 500 150",
  "M360 560 C360 520 250 520 250 470 V380",
];
const NODES: [number, number][] = [
  [500, 900], [500, 740], [360, 640], [500, 560], [660, 460], [360, 480], [250, 400], [500, 300], [660, 320], [500, 150],
];

/*
 * Phones get the same floor as a flat SVG. Every point goes once through the exact CSS 3D transform below
 * (perspective 620 from the top centre; the plane rotateX 74° and scale 2.4 about its bottom centre, which
 * sits 800px down), so it looks the same without a 3D layer. At 3x pixel density that layer overflowed the
 * GPU budget and scrolling stuttered. Coordinates: x from the container's centre, y from its top.
 */
const TILT_SIN = Math.sin((74 * Math.PI) / 180);
const TILT_COS = Math.cos((74 * Math.PI) / 180);
function project(u: number, v: number): [number, number] {
  const z = 2.4 * (v - 1000) * TILT_SIN; // depth: negative = away from you
  const s = 620 / (620 - z); // perspective
  return [2.4 * (u - 500) * s, (800 + 2.4 * (v - 1000) * TILT_COS) * s];
}
const pt = ([x, y]: [number, number]) => `${x.toFixed(1)} ${y.toFixed(1)}`;
/** GRAPH paths (M / V / C only) sampled in plane units and projected; straight runs stay straight. */
function flatPath(d: string) {
  const t = d.match(/[MVC]|-?\d+(?:\.\d+)?/g) ?? [];
  const out: string[] = [];
  let x = 0;
  let y = 0;
  for (let i = 0; i < t.length; ) {
    const c = t[i++];
    if (c === "M") {
      x = +t[i++];
      y = +t[i++];
      out.push(`M${pt(project(x, y))}`);
    } else if (c === "V") {
      y = +t[i++];
      out.push(`L${pt(project(x, y))}`);
    } else if (c === "C") {
      const [x1, y1, x2, y2, x3, y3] = t.slice(i, i + 6).map(Number);
      i += 6;
      for (let k = 1; k <= 12; k++) {
        const s = k / 12;
        const m = 1 - s;
        const bx = m * m * m * x + 3 * m * m * s * x1 + 3 * m * s * s * x2 + s * s * s * x3;
        const by = m * m * m * y + 3 * m * m * s * y1 + 3 * m * s * s * y2 + s * s * s * y3;
        out.push(`L${pt(project(bx, by))}`);
      }
      x = x3;
      y = y3;
    }
  }
  return out.join("");
}
const FLAT = {
  graph: GRAPH.map(flatPath),
  nodes: NODES.map(([u, v]) => {
    const [cx, cy] = project(u, v);
    return { cx, cy, rx: (project(u + 9, v)[0] - project(u - 9, v)[0]) / 2, ry: (project(u, v + 9)[1] - project(u, v - 9)[1]) / 2, sw: 7.2 * (620 / (620 - 2.4 * (v - 1000) * TILT_SIN)) };
  }),
  // the 64-unit grid, as straight segments (projection keeps lines straight)
  grid: Array.from({ length: 19 }, (_, k) => -64 + 64 * k).flatMap((g) => [
    `M${pt(project(g, -64))}L${pt(project(g, 1064))}`,
    `M${pt(project(-64, g))}L${pt(project(1064, g))}`,
  ]).join(""),
};

function FlatFloor({ drawn }: { drawn: boolean }) {
  return (
    <svg viewBox="-600 0 1200 440" preserveAspectRatio="xMidYMin slice" className="absolute inset-0 h-full w-full md:hidden">
      <path d={FLAT.grid} fill="none" stroke="color-mix(in oklab, var(--color-on-dark) 6%, transparent)" strokeWidth={1} />
      <g fill="none" stroke="var(--color-ember)" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" opacity={0.7}>
        {FLAT.graph.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={drawn ? 0 : 1}
            style={{ transition: `stroke-dashoffset 2.4s cubic-bezier(0.16,1,0.3,1) ${i * 0.25}s` }}
          />
        ))}
      </g>
      {FLAT.nodes.map((n, i) => (
        <ellipse
          key={i}
          cx={n.cx}
          cy={n.cy}
          rx={n.rx}
          ry={n.ry}
          fill="var(--color-dark)"
          stroke="var(--color-ember)"
          strokeWidth={n.sw}
          opacity={drawn ? 0.75 : 0}
          style={{ transition: `opacity 0.6s ${0.6 + i * 0.12}s` }}
        />
      ))}
    </svg>
  );
}

/**
 * The floor stays pinned to the section's real bottom (it moves down with the content when a row opens),
 * so it runs on its own scroll progress: 0 when its top enters the viewport, 1 when it has left.
 */
function Floor() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const still = useMotionValue(0.55);
  const p = reduce ? still : scrollYProgress;
  const opacity = useTransform(p, [0.05, 0.3], [0, 1]);
  const flow = useTransform(p, (v) => (v * 560) % 64); // grid slides toward you, seamlessly
  // The git graph draws itself once when the floor comes into view (a CSS transition, not per-frame).
  const [drawn, setDrawn] = useState(false);
  useMotionValueEvent(p, "change", (v) => {
    if (!drawn && v > 0.2) setDrawn(true);
  });
  useEffect(() => {
    if (p.get() > 0.2) setDrawn(true); // reduced motion: progress is frozen past the threshold
  }, [p]);
  return (
    <motion.div
      ref={ref}
      className="absolute inset-x-0 bottom-0 h-[440px] overflow-hidden"
      style={{ perspective: 620, perspectiveOrigin: "50% 0%", opacity, willChange: "opacity" }}
    >
      <FlatFloor drawn={drawn} />
      {/* the real 3D plane, from md up */}
      <div
        className="absolute bottom-[-360px] left-1/2 hidden h-[1000px] w-[1000px] md:block"
        style={{ transform: "translateX(-50%) rotateX(74deg) scale(2.4)", transformOrigin: "50% 100%" }}
      >
        <motion.div
          className="absolute inset-[-64px]"
          style={{
            y: flow,
            willChange: "transform",
            backgroundImage:
              "linear-gradient(to right, color-mix(in oklab, var(--color-on-dark) 6%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--color-on-dark) 6%, transparent) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <svg viewBox="0 0 1000 1000" className="absolute inset-0 h-full w-full">
          <g fill="none" stroke="var(--color-ember)" strokeWidth={3} strokeLinecap="round" opacity={0.7}>
            {GRAPH.map((d, i) => (
              <path
                key={i}
                d={d}
                pathLength={1}
                strokeDasharray="1 1"
                strokeDashoffset={drawn ? 0 : 1}
                style={{ transition: `stroke-dashoffset 2.4s cubic-bezier(0.16,1,0.3,1) ${i * 0.25}s` }}
              />
            ))}
          </g>
          {NODES.map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={9}
              fill="var(--color-dark)"
              stroke="var(--color-ember)"
              strokeWidth={3}
              opacity={drawn ? 0.75 : 0}
              style={{ transition: `opacity 0.6s ${0.6 + i * 0.12}s` }}
            />
          ))}
        </svg>
      </div>
      {/* cheap fades instead of a CSS mask (a mask forces an off-screen pass every frame) */}
      <div className="absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-dark via-dark/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-dark to-transparent" />
    </motion.div>
  );
}
