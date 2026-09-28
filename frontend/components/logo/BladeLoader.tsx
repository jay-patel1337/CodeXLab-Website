import { Badge } from "./LogoMark";
import { blades, GLYPH_VIEWBOX, type BladeKey } from "./geometry";

const seq: BladeKey[] = ["tl", "tr", "br", "bl"];

/** Loader: the four blades pulse in sequence around the { } badge. */
export function BladeLoader({ className = "h-5 w-5", tone = "light" }: { className?: string; tone?: "light" | "dark" | "mono" }) {
  return (
    <svg viewBox={GLYPH_VIEWBOX} className={className} role="status" aria-label="Loading">
      <g>
        {seq.map((k, i) => (
          <path
            key={k}
            d={blades[k]}
            className={`${tone === "mono" ? "fill-current" : k === "tl" || k === "bl" ? (tone === "light" ? "fill-ink" : "fill-on-dark") : "fill-ember"} blade-pulse`}
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </g>
      {tone !== "mono" && (
        <Badge tone={tone} />
      )}
    </svg>
  );
}
