"use client";

import { useState, type ReactNode } from "react";
import { CompileMark } from "@/components/logo/CompileMark";
import { LogoMark } from "@/components/logo/LogoMark";
import { BladeLoader } from "@/components/logo/BladeLoader";
import { HookButton } from "@/components/sections/HookButton";
import { BracketButton } from "@/components/ui/BracketButton";
import { useXWipe } from "@/components/ui/XWipe";
import { INTRO_KEY } from "@/components/sections/Hero";

function Tile({ title, note, children, dark = false, wide = false }: { title: string; note: string; children: ReactNode; dark?: boolean; wide?: boolean }) {
  return (
    <section className={`flex flex-col overflow-hidden rounded-xl border p-6 ${wide ? "md:col-span-2" : ""} ${dark ? "border-dark-hairline bg-dark" : "border-hairline bg-surface-card"}`}>
      <div className="grid min-h-[220px] flex-1 place-items-center">{children}</div>
      <h2 className={`mt-6 font-mono text-sm ${dark ? "text-on-dark" : "text-ink"}`}>{title}</h2>
      <p className={`mt-1 text-sm ${dark ? "text-on-dark-soft" : "text-muted"}`}>{note}</p>
    </section>
  );
}

/** Motion playground: every logo animation in isolation, for review. */
export function LabPlayground() {
  const [replay, setReplay] = useState(0);
  const { navigate } = useXWipe();

  const replayIntro = () => {
    try {
      sessionStorage.removeItem(INTRO_KEY);
    } catch {}
    window.location.href = "/";
  };

  return (
    <div className="mx-auto max-w-[1200px] px-5 pb-28 pt-32 md:px-10">
      <p className="font-mono text-sm text-muted">{"// internal: not linked from the site"}</p>
      <h1 className="mt-3 font-display text-5xl font-bold tracking-[-0.04em] text-ink">
        Motion <span className="text-ember">lab</span>
      </h1>
      <p className="mt-4 max-w-[60ch] text-body">Each CodeXLab animation on its own, so you can review it before it goes on the site.</p>

      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <Tile title="01 · compile" note="Blades fly in from the corners, the { } badge stamps in. Home intro, join success.">
          <div className="flex flex-col items-center gap-5">
            <CompileMark key={replay} className="h-32 w-32 overflow-visible" />
            <BracketButton variant="ghost" onClick={() => setReplay((r) => r + 1)}>
              Replay
            </BracketButton>
          </div>
        </Tile>

        <Tile title="02 · full intro → hero" note="Clears the 'seen' flag and reloads the home page so the full intro plays again.">
          <BracketButton onClick={replayIntro}>Replay intro</BracketButton>
        </Tile>

        <Tile title="03 · X wipe" note="Page transition: graphite + ember bands cross on the diagonals.">
          <BracketButton variant="ink" onClick={() => navigate("/lab")}>
            Run wipe
          </BracketButton>
        </Tile>

        <Tile title="04 · hook button" note="Hover: brackets + the X parts. Click: runs, fills ember, wipes to /join." dark wide>
          <HookButton />
        </Tile>

        <Tile title="05 · loader" note="Blades pulse in sequence around the badge. Used in form submit.">
          <div className="flex items-center gap-8">
            <BladeLoader className="h-16 w-16" />
            <BladeLoader className="h-8 w-8" />
          </div>
        </Tile>

        <Tile title="06 · bracket buttons" note="Label becomes <Label/> on hover or focus.">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <BracketButton>Join</BracketButton>
            <BracketButton variant="ink">Sessions</BracketButton>
            <BracketButton variant="ghost">Goals</BracketButton>
          </div>
        </Tile>

        <Tile title="07 · marks, light" note="Static SVG rebuild: full <X/> mark and the X glyph.">
          <div className="flex items-center gap-8">
            <LogoMark className="h-20 w-auto" />
            <LogoMark variant="glyph" className="h-16 w-auto" />
          </div>
        </Tile>

        <Tile title="08 · marks, dark" note="Graphite blades flip to cream; ember stays." dark>
          <div className="flex items-center gap-8">
            <LogoMark tone="dark" className="h-20 w-auto" />
            <LogoMark variant="glyph" tone="dark" className="h-16 w-auto" />
          </div>
        </Tile>
      </div>
    </div>
  );
}
