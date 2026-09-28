/**
 * The "<" and "/>" of <X/>, drawn from the logo's bracket geometry (components/logo/geometry.ts)
 * so every tag on the site matches the mark instead of whatever the current font's glyph looks like.
 *
 * Units: 100 = 1em. The box runs from 0.8em above the baseline to 0.1em below it.
 * - chevrons: 52 tall, 36 wide, centred 0.34em above the baseline (sits with mixed-case words)
 * - slash: taller than the chevrons, as in the logo, leaning 0.36
 * - the ">" is placed so its top arm clears the slash by 10 units (the old 1-unit overlap
 *   read as one merged "flag" shape at heading sizes)
 * Colour comes from currentColor.
 */
const BOX = { open: "0 0 48 90", close: "0 0 94 90" } as const;
const WIDTH = { open: "0.48em", close: "0.94em" } as const;

export function Bracket({ side, weight = 12, className = "" }: { side: "open" | "close"; weight?: number; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox={BOX[side]}
      className={`inline-block shrink-0 align-[-0.1em] ${className}`}
      style={{ width: WIDTH[side], height: "0.9em" }}
      fill="none"
      stroke="currentColor"
      strokeWidth={weight}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {side === "open" ? (
        <path d="M42 20 6 46 42 72" />
      ) : (
        <>
          <path d="M6 83 32.6 9" />
          <path d="M52 20 88 46 52 72" />
        </>
      )}
    </svg>
  );
}
