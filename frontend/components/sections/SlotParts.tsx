import type { CSSProperties } from "react";
import { G_ARRAY, G_LIST } from "./useWordLoop";

/*
 * The data-structure drawing for one slot of the hero word (animated by useWordLoop).
 * Everything here is invisible until the loop runs. Geometry comes from CSS variables on the slot,
 * in em of the hero font, so it tracks the responsive size without measuring:
 *   --ct / --cb   how far a cell reaches above / below the slot box (cells span baseline -0.12em … +0.84em)
 *   --cl / --cr   extra width left / right (the X slot's margins)
 *   --mid         the cell's vertical middle, measured from the slot top
 * The em values here resolve against the hero font because these wrappers never set a font-size;
 * only the text inside them does.
 */

/** Letter slots: the box is the 0.8em line box; --bl (baseline inset, measured by the loop) places the baseline. */
export const LETTER_SLOT: Record<string, string> = {
  "--ct": "calc(0.04em + var(--bl, 0.033em))",
  "--cb": "calc(0.12em - var(--bl, 0.033em))",
  "--mid": "calc(0.44em - var(--bl, 0.033em))",
};
/** The X slot: 0.72em tall, standing on the baseline, with 0.05em / 0.01em margins. */
export const X_SLOT: Record<string, string> = { "--ct": "0.12em", "--cb": "0.12em", "--mid": "0.36em", "--cl": "0.05em", "--cr": "0.01em" };

const vertical = { top: "calc(-1 * var(--ct))", bottom: "calc(-1 * var(--cb))" };
/** Array cells meet halfway across the gap the array view opens between letters. */
const CELL: CSSProperties = {
  ...vertical,
  left: `calc(-1 * var(--cl, 0em) - ${G_ARRAY / 2}em)`,
  right: `calc(-1 * var(--cr, 0em) - ${G_ARRAY / 2}em)`,
};
/** List nodes hug their letter; the rest of the gap is the pointer. */
const NODE: CSSProperties = { ...vertical, left: "calc(-1 * var(--cl, 0em) - 0.03em)", right: "calc(-1 * var(--cr, 0em) - 0.03em)" };
const small = "font-mono text-[clamp(10px,0.05em,14px)] font-normal leading-none tracking-normal";

const MARKS: Record<number, string[]> = { 0: ["front", "head"], 4: ["top", "rear"], 5: ["top", "rear"], 6: ["top", "rear"], 7: ["top", "rear"] };

/** A next-pointer: dot on the node wall, line, arrowhead. px strokes, so it stays crisp at any width. */
function Arrow({ width, data }: { width: string; data?: boolean }) {
  return (
    <svg
      aria-hidden
      data-arrow={data ? "" : undefined}
      className={`block overflow-visible text-ember ${data ? "absolute opacity-0" : "shrink-0"}`}
      style={data ? { width, height: 12, left: "calc(100% + var(--cr, 0em) + 0.03em)", top: "var(--mid)", marginTop: -6 } : { width, height: 12 }}
    >
      <circle cx="0" cy="6" r="3.5" fill="currentColor" />
      <line x1="0" y1="6" x2="100%" y2="6" stroke="currentColor" strokeWidth="2" transform="translate(-2 0)" />
      <svg x="100%" y="6" overflow="visible">
        <path d="M-8 -5 -1 0 -8 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </svg>
  );
}

export function SlotParts({ i }: { i: number }) {
  return (
    <span aria-hidden className="pointer-events-none">
      {/* array cell: left/top/bottom walls (+ the right wall on the last), so shared walls stay one line */}
      <span data-cell className={`absolute border-y-[1.5px] border-l-[1.5px] border-ink/30 opacity-0 ${i === 7 ? "border-r-[1.5px]" : ""}`} style={CELL} />
      {/* list node: its own rounded box */}
      <span data-node className="absolute rounded-[0.06em] border-[1.5px] border-ink/40 opacity-0" style={NODE} />
      {/* index, under the cell */}
      <span data-idx className="absolute inset-x-0 flex justify-center opacity-0" style={{ top: "calc(100% + var(--cb) + 0.04em)" }}>
        <span className={`${small} text-muted`}>{i}</span>
      </span>
      {/* pointers: top (stack), front / rear (queue), head (list) */}
      {MARKS[i]?.map((kind) => (
        <span
          key={kind}
          data-mark={kind}
          data-i={i}
          className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 opacity-0"
          style={{ bottom: "calc(100% + var(--ct) + 0.04em)" }}
        >
          <span className={`${small} font-medium text-ember-text`}>{kind}</span>
          <svg viewBox="0 0 10 12" className="h-[clamp(7px,0.035em,11px)] w-auto text-ember" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 1v9.5M1.5 7 5 10.5 8.5 7" />
          </svg>
        </span>
      ))}
      {/* next pointer to the following node, or "→ null" after the last */}
      {i < 7 ? (
        <Arrow data width={`${G_LIST - 0.06}em`} />
      ) : (
        <span data-null className="absolute flex items-center gap-2 opacity-0" style={{ left: "calc(100% + 0.03em)", top: "var(--mid)", height: 12, marginTop: -6 }}>
          <Arrow width="0.12em" />
          <span className={`${small} text-muted`}>null</span>
        </span>
      )}
    </span>
  );
}
