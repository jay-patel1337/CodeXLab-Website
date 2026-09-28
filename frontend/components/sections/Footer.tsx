import Link from "next/link";
import { LogoMark } from "@/components/logo/LogoMark";
import { SectionLink } from "@/components/ui/SectionJump";
import { SouLockupWide } from "@/components/logo/SouLockup";
import { nav, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="bg-dark text-on-dark-soft">
      <div className="mx-auto max-w-[1200px] px-5 pb-10 pt-20 md:px-10 md:pt-28">
        <p className="max-w-[20ch] font-mono text-[clamp(1.6rem,4.4vw,3.4rem)] leading-[1.1] tracking-[-0.02em] text-on-dark">
          Har Code Se <span className="text-ember">Future</span> Onboard.
        </p>

        <div className="mt-16 grid gap-12 border-t border-dark-hairline pt-12 md:grid-cols-[1.4fr_1fr]">
          <div>
            <Link href="/" aria-label="CodeXLab home" className="inline-flex items-center gap-3 text-on-dark">
              <LogoMark variant="mark" tone="dark" className="h-9 w-auto" />
              <span className="font-display text-2xl font-bold tracking-[-0.04em]">
                Code<span className="text-ember">X</span>Lab
              </span>
            </Link>
            <p className="mt-4 max-w-[36ch] text-sm leading-relaxed">{site.description}</p>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-on-dark">Explore</p>
            {/* phones: two columns of thumb-sized (44px) rows; md+: the compact list */}
            <ul className="mt-3 grid grid-cols-2 gap-x-6 text-[15px] md:mt-4 md:block md:space-y-2.5 md:text-sm">
              {[...nav, { label: "Join", href: "/join" }].map((item) => (
                <li key={item.href}>
                  <SectionLink href={item.href} className="flex min-h-11 items-center transition-colors hover:text-on-dark active:text-on-dark md:inline md:min-h-0">
                    {item.label}
                  </SectionLink>
                </li>
              ))}
              {site.socials.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noreferrer" className="flex min-h-11 items-center transition-colors hover:text-on-dark active:text-on-dark md:inline md:min-h-0">
                    {s.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* University band: official artwork on cream at a size where its lettering stays readable. */}
        <a
          href={site.universityUrl}
          target="_blank"
          rel="noreferrer"
          className="group mt-14 flex flex-col gap-6 rounded-xl bg-canvas px-6 py-7 transition-transform duration-300 hover:-translate-y-0.5 md:flex-row md:items-center md:justify-between md:px-10"
        >
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Part of</p>
            <p className="mt-2 font-display text-xl font-semibold tracking-[-0.02em] text-ink md:text-2xl">
              The coding club of {site.university} <span className="inline-block text-ember transition-transform group-hover:translate-x-0.5">↗</span>
            </p>
          </div>
          <SouLockupWide />
        </a>

        <div className="mt-14 flex flex-col justify-between gap-3 font-mono text-xs md:flex-row">
          <span>© {new Date().getFullYear()} CodeXLab · Coding Club, {site.university}</span>
          <span>
            built with <span className="text-ember">{"{ }"}</span> by CodeXLab
          </span>
        </div>
      </div>
    </footer>
  );
}
