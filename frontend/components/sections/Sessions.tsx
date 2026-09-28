import { getSessions, type Session } from "@/lib/sessions";
import { TagHeading } from "@/components/ui/TagHeading";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { CodeSpace } from "@/components/sessions/CodeSpace";
import { Reveal } from "@/components/ui/Reveal";
import { SessionsLog } from "./SessionsLog";

/** A laptop with a live prompt on screen (the underscore blinks). */
function LaptopIcon() {
  return (
    <svg viewBox="0 0 24 20" aria-hidden className="h-5 w-6 shrink-0 text-ember" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2.5" width="16" height="11" rx="1.5" />
      <path d="M1.5 17h21" />
      <path d="M8.5 6.2 11 8l-2.5 1.8" />
      <path d="M12.5 10h3" className="animate-caret" />
    </svg>
  );
}

function stats(sessions: Session[]) {
  const topics = new Set(sessions.flatMap((s) => s.tags)).size;
  const first = sessions.at(-1)?.date;
  const firstLabel = first
    ? new Date(`${first}T00:00:00`).toLocaleDateString("en-IN", { month: "short", year: "2-digit" }).replace(" ", " '")
    : "soon";
  return [
    { value: String(sessions.length).padStart(2, "0"), label: "sessions shipped" },
    { value: String(topics).padStart(2, "0"), label: "topics covered" },
    { value: "00", label: "prerequisites to join" },
    { value: firstLabel, label: "first commit" },
  ];
}

export async function Sessions() {
  const { sessions, source } = await getSessions();
  const commits = sessions.map((s) => ({ hash: s.hash, label: s.id.replace(/[^a-z0-9]+/gi, "-").slice(0, 26) }));

  return (
    <section id="sessions" aria-labelledby="sessions-title" className="relative isolate bg-dark text-on-dark">
      <CodeSpace commits={commits} />

      <div className="mx-auto max-w-[1200px] px-5 pb-56 pt-20 md:px-10 md:pb-80 md:pt-28">
        <TagHeading id="sessions-title" name="Sessions" eyebrow="// what we've shipped so far" tone="dark" size="xl" />
        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <div>
            <p className="max-w-[30ch] text-[clamp(1.25rem,2.2vw,1.75rem)] leading-snug text-on-dark-soft">
              Every session is a commit to the club&apos;s history: a topic, a room full of people and something built before it
              ended. <span className="text-on-dark">Here&apos;s the log.</span>
            </p>
          </div>

          <dl className="grid grid-cols-2 overflow-hidden rounded-2xl border border-dark-hairline bg-dark-hairline [gap:1px]">
            {stats(sessions).map((s) => (
              <div key={s.label} className="bg-dark-soft/90 px-5 py-6 md:px-7 md:py-8">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <ScrambleText
                    text={s.value}
                    className="block font-display text-[clamp(2.2rem,4.4vw,3.6rem)] font-bold leading-none tracking-[-0.04em] text-on-dark"
                  />
                  <span className="mt-3 block font-mono text-xs text-on-dark-soft">{s.label}</span>
                </dd>
              </div>
            ))}
            {/* The one thing worth bringing. A highlighter sweeps across it once the card is in view. */}
            <Reveal className="col-span-2 bg-dark-soft/90 px-5 py-5 md:px-7">
              <dt className="sr-only">good to know</dt>
              <dd className="flex items-center gap-4">
                <LaptopIcon />
                <p className="font-mono text-[13px] leading-relaxed text-on-dark-soft">
                  <span className="relative isolate inline-block whitespace-nowrap px-1 font-medium text-on-dark">
                    <span
                      aria-hidden
                      className="absolute inset-x-0 -inset-y-0.5 -z-10 origin-left -skew-x-6 scale-x-0 rounded-[3px] bg-ember/45 transition-[scale] delay-[900ms] duration-[1200ms] ease-soft in-[.in]:scale-x-100"
                    />
                    Bring your own laptop
                  </span>{" "}
                  if you can
                  <span className="block text-on-dark-soft/80">every session is hands-on</span>
                </p>
              </dd>
            </Reveal>
          </dl>
        </div>

        {source === "sample" && (
          <p className="mt-10 inline-block rounded-md border border-dark-hairline bg-dark/80 px-3 py-1.5 font-mono text-xs text-on-dark-soft">
            <span className="text-terminal">i</span> sample data: connect the Google Sheet (SESSIONS_CSV_URL) to show real sessions
          </p>
        )}

        <SessionsLog sessions={sessions} sample={source === "sample"} />
      </div>
    </section>
  );
}
