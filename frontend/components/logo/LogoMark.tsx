import { blades, BRACE_W, braces, BRACKET_W, brackets, GLYPH_VIEWBOX, MARK_VIEWBOX } from "./geometry";

export type Tone = "light" | "dark";

type Props = {
  /** "glyph" = the X only, "mark" = <X/> with brackets */
  variant?: "glyph" | "mark";
  tone?: Tone;
  className?: string;
  title?: string;
};

/** Graphite parts flip to cream on dark surfaces; ember never changes. */
export const inkFill = (tone: Tone) => (tone === "light" ? "fill-ink" : "fill-on-dark");
export const inkStroke = (tone: Tone) => (tone === "light" ? "stroke-ink" : "stroke-on-dark");

/** Static, server-renderable CodeXLab mark. */
export function LogoMark({ variant = "mark", tone = "light", className, title = "CodeXLab" }: Props) {
  return (
    <svg viewBox={variant === "mark" ? MARK_VIEWBOX : GLYPH_VIEWBOX} className={className} role="img" aria-label={title}>
      <path d={blades.tl} className={inkFill(tone)} />
      <path d={blades.bl} className={inkFill(tone)} />
      <path d={blades.tr} className="fill-ember" />
      <path d={blades.br} className="fill-ember" />
      <Badge tone={tone} />
      {variant === "mark" && <Brackets tone={tone} />}
    </svg>
  );
}

/** Braces in the empty ring at the crossing: { graphite, } ember. (The ring itself is cut out of the blades.) */
export function Badge({ tone = "light", pulse = false }: { tone?: Tone; pulse?: boolean }) {
  return (
    <g fill="none" strokeWidth={BRACE_W} strokeLinecap="round" strokeLinejoin="round" className={pulse ? "animate-brace" : undefined}>
      <path d={braces.left} className={inkStroke(tone)} />
      <path d={braces.right} className="stroke-ember" />
    </g>
  );
}

export function Brackets({ tone = "light" }: { tone?: Tone }) {
  return (
    <g fill="none" strokeWidth={BRACKET_W} strokeLinecap="round" strokeLinejoin="round">
      <path d={brackets.lt} className={inkStroke(tone)} />
      <path d={brackets.slash} className="stroke-ember" />
      <path d={brackets.gt} className="stroke-ember" />
    </g>
  );
}
