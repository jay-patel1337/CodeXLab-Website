/**
 * Vector rebuild of the CodeXLab X, measured from CodeXLab Logo.jpeg.
 * Glyph space: 120 × 110, crossing at (60, 55). 1 unit ≈ 4px of the 1254px source.
 *
 * Construction (matches the original):
 * - The TL→BR diagonal is continuous: graphite top-left, ember bottom-right.
 * - The TR→BL diagonal is cut by a GAP-wide channel running parallel to it.
 * - Outer ends are flat; obtuse corners rounded (R_OBTUSE), acute corners nearly sharp (R_ACUTE).
 * - Every blade is clipped by one circle of radius RING_R around the crossing, so the core is a
 *   clean empty ring on any background: no tips or corners can poke into it.
 *   The braces sit inside: { graphite, } ember.
 * Paths are computed from these parameters, so tuning a number regenerates every blade.
 */
export const W = 120;
export const H = 110;
export const CENTER = { x: 60, y: 55 } as const;
export const RING_R = 16;

const END_W = 29; // width of each blade's flat outer end
const SLOPE_OUT = 0.9; // outer edge dx/dy
const SLOPE_IN = 0.83; // inner edge dx/dy
const GAP = 4; // channel between the two diagonals
const R_ACUTE = 1.4;
const R_OBTUSE = 5.5;

type Pt = { x: number; y: number };
type Vertex = Pt & { r: number };
type Node = (Pt & { kind: "v"; r: number }) | (Pt & { kind: "in" }) | (Pt & { kind: "out" });

const f = (n: number) => String(Math.round(n * 100) / 100);
const p = (pt: Pt) => `${f(pt.x)} ${f(pt.y)}`;
const inRing = (pt: Pt) => Math.hypot(pt.x - CENTER.x, pt.y - CENTER.y) < RING_R;

/** Parameters t∈(0,1) where segment a→b crosses the ring circle. */
function crossings(a: Pt, b: Pt): number[] {
  const dx = b.x - a.x, dy = b.y - a.y, fx = a.x - CENTER.x, fy = a.y - CENTER.y;
  const A = dx * dx + dy * dy, B = 2 * (fx * dx + fy * dy), C = fx * fx + fy * fy - RING_R * RING_R;
  const disc = B * B - 4 * A * C;
  if (disc <= 0) return [];
  const s = Math.sqrt(disc);
  return [(-B - s) / (2 * A), (-B + s) / (2 * A)].filter((t) => t > 0 && t < 1);
}

function insidePolygon(pt: Pt, poly: Pt[]) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if (a.y > pt.y !== b.y > pt.y && pt.x < ((b.x - a.x) * (pt.y - a.y)) / (b.y - a.y) + a.x) hit = !hit;
  }
  return hit;
}

/** Polygon minus the ring disc → SVG path. Outer corners rounded, ring edge follows the circle exactly. */
function blade(poly: Vertex[]): string {
  const nodes: Node[] = [];
  poly.forEach((a, i) => {
    const b = poly[(i + 1) % poly.length];
    if (!inRing(a)) nodes.push({ kind: "v", x: a.x, y: a.y, r: a.r });
    for (const t of crossings(a, b)) {
      const pt = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
      const entering = !inRing({ x: a.x + (b.x - a.x) * (t - 1e-4), y: a.y + (b.y - a.y) * (t - 1e-4) });
      nodes.push({ kind: entering ? "in" : "out", ...pt });
    }
  });

  const pull = (from: Pt, to: Pt, r: number) => {
    const len = Math.hypot(to.x - from.x, to.y - from.y);
    const k = Math.min(r, len / 2) / len;
    return { x: from.x + (to.x - from.x) * k, y: from.y + (to.y - from.y) * k };
  };

  let d = "";
  nodes.forEach((node, i) => {
    const prev = nodes[(i - 1 + nodes.length) % nodes.length];
    const next = nodes[(i + 1) % nodes.length];
    const move = i === 0 ? "M" : "L";
    if (node.kind === "v" && node.r > 0) {
      d += `${move}${p(pull(node, prev, node.r))}Q${p(node)} ${p(pull(node, next, node.r))}`;
    } else if (node.kind === "out" && prev.kind === "in") {
      // Arc along the ring from entry to exit, on the side that lies inside the blade.
      const a0 = Math.atan2(prev.y - CENTER.y, prev.x - CENTER.x);
      const a1 = Math.atan2(node.y - CENTER.y, node.x - CENTER.x);
      let delta = a1 - a0;
      while (delta <= -Math.PI) delta += 2 * Math.PI;
      while (delta > Math.PI) delta -= 2 * Math.PI;
      const mid = a0 + delta / 2;
      const shortInside = insidePolygon({ x: CENTER.x + RING_R * Math.cos(mid), y: CENTER.y + RING_R * Math.sin(mid) }, poly);
      const large = shortInside ? 0 : 1;
      const sweep = (delta > 0) === shortInside ? 1 : 0;
      d += `A${f(RING_R)} ${f(RING_R)} 0 ${large} ${sweep} ${p(node)}`;
    } else {
      d += `${move}${p(node)}`;
    }
  });
  return d + "Z";
}

// ---- The four blades ----
const yMid = CENTER.y;
const TL: Vertex[] = [
  { x: 0, y: 0, r: R_ACUTE },
  { x: END_W, y: 0, r: R_OBTUSE },
  { x: END_W + SLOPE_IN * yMid, y: yMid, r: 0 },
  { x: SLOPE_OUT * yMid, y: yMid, r: 0 },
];
// TR is TL mirrored, then cut by a line parallel to TL's inner edge (offset by GAP).
const trOuter = (y: number) => W - SLOPE_OUT * y;
const cut = (y: number) => END_W + GAP + SLOPE_IN * y;
const yNotch = (W - END_W - (END_W + GAP)) / (2 * SLOPE_IN); // inner edge meets the cut
const yTip = (W - (END_W + GAP)) / (SLOPE_OUT + SLOPE_IN); // outer edge meets the cut (inside the ring)
const TR: Vertex[] = [
  { x: W - END_W, y: 0, r: R_OBTUSE },
  { x: W, y: 0, r: R_ACUTE },
  { x: trOuter(yTip), y: yTip, r: 0 },
  { x: cut(yNotch), y: yNotch, r: 0.8 },
];
const rot = (poly: Vertex[]): Vertex[] => poly.map((v) => ({ x: W - v.x, y: H - v.y, r: v.r }));

export const blades = {
  tl: blade(TL),
  tr: blade(TR),
  br: blade(rot(TL)),
  bl: blade(rot(TR)),
} as const;

export type BladeKey = keyof typeof blades;

// ---- Braces inside the ring (stroked) ----
const BRACE_SCALE = 1.15;
export const BRACE_W = 2.9;
// Left brace relative to the centre; the right brace is its mirror.
const braceTemplate: [string, number[]][] = [
  ["M", [-3.6, -8.1]],
  ["Q", [-6.4, -8.1, -6.4, -5.2]],
  ["L", [-6.4, -2.4]],
  ["Q", [-6.4, 0, -8.9, 0]],
  ["Q", [-6.4, 0, -6.4, 2.4]],
  ["L", [-6.4, 5.2]],
  ["Q", [-6.4, 8.1, -3.6, 8.1]],
];
const brace = (mirror: 1 | -1) =>
  braceTemplate
    .map(([cmd, nums]) => {
      const pts: string[] = [];
      for (let i = 0; i < nums.length; i += 2) {
        pts.push(`${f(CENTER.x + mirror * nums[i] * BRACE_SCALE)} ${f(CENTER.y + nums[i + 1] * BRACE_SCALE)}`);
      }
      return cmd + pts.join(" ");
    })
    .join("");
export const braces = { left: brace(1), right: brace(-1) } as const;

// ---- "<" (graphite) and "/>" (ember) flanking the X (stroked) ----
export const brackets = {
  lt: "M0.5 44.1L-13.3 54.1L0.5 62.6",
  slash: "M121.5 41.8L111.7 64.4",
  gt: "M127.5 47.1L136.8 54.1L127.5 61.4",
} as const;
export const BRACKET_W = 3.3;

/** Unit vector from the centre out along each blade (split / magnetic motion). */
export const bladeDir: Record<BladeKey, { x: number; y: number }> = {
  tl: { x: -0.66, y: -0.75 },
  bl: { x: -0.66, y: 0.75 },
  tr: { x: 0.66, y: -0.75 },
  br: { x: 0.66, y: 0.75 },
};

/** Where each blade flies in from during the "compile" intro (glyph units). */
export const bladeEntry: Record<BladeKey, { x: number; y: number; rotate: number }> = {
  tl: { x: -140, y: -120, rotate: -18 },
  bl: { x: -140, y: 120, rotate: 18 },
  tr: { x: 140, y: -120, rotate: 18 },
  br: { x: 140, y: 120, rotate: -18 },
};

/** viewBox for the X alone and for the full <X/> mark */
export const GLYPH_VIEWBOX = "-1 -1 122 112";
export const MARK_VIEWBOX = "-17 -1 156 112";
