import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { SectionLink } from "@/components/ui/SectionJump";

export const metadata: Metadata = { title: "Not found" };

/** Branded 404 (Next's default one is unstyled and paints the page white). */
export default function NotFound() {
  return (
    <div className="page-enter mx-auto max-w-[920px] px-5 pb-28 pt-32 md:px-10 md:pt-40">
      <PageHeader name="NotFound" eyebrow="// 404 · no such route" lead="This page doesn't exist, or it moved. Everything else is right where you left it." />
      <div className="flex flex-col gap-3 sm:flex-row">
        <SectionLink
          href="/"
          className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-ink px-6 font-medium text-canvas transition-[background-color,transform,scale] duration-150 hover:bg-dark active:scale-[0.98] sm:w-auto"
        >
          <span className="font-mono">←</span> Back to home
        </SectionLink>
        <SectionLink
          href="/join"
          className="inline-flex h-12 w-full items-center justify-center rounded-lg border border-hairline px-6 font-medium text-ink transition-[border-color,transform,scale] duration-150 hover:border-muted-soft active:scale-[0.98] sm:w-auto"
        >
          Join the club
        </SectionLink>
      </div>
    </div>
  );
}
