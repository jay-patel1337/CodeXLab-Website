# Decisions log

This is a short, append-only record of settled choices. Check it before re-deciding anything. See `TOKEN_OPTIMIZATION_RULES.md`.

| Date | Decision | Why |
|---|---|---|
| 2026-09-25 | Next.js 16 (App Router) + Tailwind v4 + `motion` + `gsap` + `zod` | User choice; this is the taste-skill default stack |
| 2026-09-25 | Sessions content from a **Google Sheet** published as CSV, ISR hourly, fallback `data/sessions.fallback.json` | User choice: non-coders can update it |
| 2026-09-25 | Join + Feedback → `/api/submit` → **Google Apps Script** → Sheet tabs `Join` / `Feedback` | User choice; the script URL stays server-side (`APPS_SCRIPT_URL`, not `NEXT_PUBLIC_`) |
| 2026-09-25 | Feedback form is **basic** on purpose | User will plan the full feedback system separately |
| 2026-09-25 | Display font **Outfit** (not the serif from the old reference DESIGN.md) | The logo wordmark is a geometric sans. The taste skill bans Inter. Satoshi isn't on Google Fonts |
| 2026-09-25 | Hero X is the **two-tone blade glyph**, not a typed "X" | It carries the logo into the wordmark and makes the split effect possible |
| 2026-09-25 | Split-X reveal is a **vertical curtain**, not a diamond | The diamond read as a fish shape; the curtain turns the halves into `>` `<` around the gap |
| 2026-09-25 | GSAP pins an inner `<section>` inside a React-owned `<div>` | The pin-spacer otherwise crashes React unmount (`removeChild`) on route change |
| 2026-09-25 | Light mode only for the MVP | Default from the plan; dark mode tokens already exist (`tone="dark"` marks) |
| 2026-09-25 | Original Claude DESIGN.md moved to `docs/reference/` | Kept as reference; the CodeXLab `DESIGN.md` replaces it |
| 2026-09-25 | Docker: multi-stage `node:22-alpine`, Next `output: "standalone"`, compose + `start.bat`/`stop.bat` | One-click local run on Windows; image ~309MB, runs as non-root |
| 2026-09-25 | Logo rebuilt from pixel measurements (fill-only paths, continuous TL→BR diagonal, `}` in ember); `npm run brand` exports assets | The first rebuild was an approximation with uniform stroke rounding |
| 2026-09-25 | Navbar shows the SOU lockup; on scroll only NAAC folds, the seal and name stay | User requirement: the university logo must never disappear |
| 2026-09-25 | SOU artwork is split and trimmed only, never recolored | It is official university branding |
| 2026-09-25 | Intro slowed to ~3.4s (softer springs, 0.16s blade stagger, 1.1s flight into the wordmark) | User: visitors should feel the animation |
| 2026-09-25 | Navbar compact state is transform/opacity only (bg scaleY, row scale, SOU slides via translateX); no backdrop-blur | The old height/width/blur transitions dropped frames (worst 33ms vs 17ms at 4× CPU throttle) |
| 2026-09-25 | After the GSAP pin is created, re-scroll to `location.hash` | A hash jump made before the pin existed landed mid-split |
| 2026-09-25 | Curtain switches to visible instantly and starts as a 6% slab | Fading made it grey; a zero-width start showed as a 1px line |
| 2026-09-25 | Blades are clipped by the ring circle (r 16) instead of a cream circle drawn on top; paths computed in `geometry.ts` | Blade tips and corners poked 0.6–1.5 units outside the old r 14 cover; the clip makes the ring clean on any background |
| 2026-09-25 | Navbar keeps the full official SOU lockup (NAAC included) at all scroll positions; bar 96px, then 80px | User: never hide the NAAC rating; logos must stay clean and legible |
| 2026-09-25 | SOU logo: pre-rendered pixel-exact PNGs per density (1x–3x) in a fixed integer CSS box, plain `<img srcset>`, plus `usePixelSnap`; no scaling in the compact navbar | The optimizer served a 240px file at every DPR (upscaled 1.5× on 150% displays), and the logo sat at x = 323.66px |
| 2026-09-25 | Session photos via Sheet `cover_image_url` + `photos` (multi-link; Drive share links converted); reserved frames when empty; lightbox | User: session details need image spaces |
| 2026-09-25 | Navbar section jumps use the "X shutter"; hero cue uses a GSAP ScrollTo glide | User: section navigation needs a distinctive transition, not a plain scroll |
| 2026-09-25 | Sessions "code space" is CSS 3D (no three.js) | Crisp code text on 3D planes, no extra bundle weight |
| 2026-09-25 | Perf fixes: curtain clip-path → scaleX; objects end at opacity 1; will-change on movers; floor mask → gradient overlays; graph draws once; particles in 3 layers | Frame profiling at 1×/2×/4× CPU showed repaint/off-screen passes; now a 60fps median at 1× and 2× |
| 2026-09-25 | Slower, calmer arrivals: reveals 1.2–1.4s with 12px travel and a soft ease; wipe, shutter, hero letters, headings and scramble slowed | User: animations should appear slowly and feel smooth and promising |
| 2026-09-25 | All page links use the X wipe; `/join` and `/feedback` fields stagger in | User: Feedback had no transition or loading motion |
| 2026-09-25 | 3D objects get one hover pose each (transform transitions on a wrapper; stable hit box) | User: simple hover on the 3D models |
| 2026-09-25 | Goals rebuilt as a CI pipeline (`grow.yml`) ending in `deploy → you` with the hook; section uses `overflow-clip` so the log stays sticky | User: Goals should be distinctive, animated and meaningful; the goal copy is still placeholder |
| 2026-09-26 | SOU source switched to `SOU_LOGO_new-removebg (1) (9) (1).png` (newer official lockup, cleaner NAAC badge); footer widths capped at the source width | The supplied SVG was a VTracer auto-trace of the old PNG (thickened, jagged letters; merged tree detail), so it was rejected |
| 2026-09-26 | Raster boxes padded to multiples of 4 CSS px; navbar lockup 56px from md; off-grid densities use the full-res original; ?v=hash cache-busting | A 229px/261px box is 286.25/326.25 device px at 125%, so the browser stretched the logo by a fraction (the lingering blur) |
| 2026-09-26 | ScrambleText reserves its final size (invisible real text, scramble overlaid) | Random glyph widths resized the stat boxes every frame, making the content below jump |
| 2026-09-26 | SOU source reverted to the original `N SOU X NAAC Logo - N SOU X NAAC Logo.png` | User preferred the first logo over `SOU_LOGO_new` |
| 2026-09-26 | Web app moved into `frontend/`; brand source art in `frontend/brand-source/`; root keeps only Docker launchers, `apps-script/` and tooling | User wants the frontend self-contained, not spread across the repo root |
| 2026-09-26 | One `Bracket` SVG (logo geometry) replaces every mono `<` `/>` glyph | Mono glyphs were thin next to Outfit Bold and differed from the mark |
| 2026-09-26 | Hero entrance: letters unfold from the X via CSS keyframes (was a motion blur-rise that never fired); hover shows char codes | Ties the word to the X; blur filters on 19vw text are costly |
| 2026-09-26 | Session expand: ease-in-out height + 60ms delay + separate content fade; li `layout="position"` | Measured: 67ms mount frame + ease-out = 213px first-frame jump; now steady 17ms frames |
| 2026-09-26 | Stats: "∞ questions asked" → "00 prerequisites to join" (when no attendance data) | Honest and inviting, instead of a filler number |
| 2026-09-26 | Bracket geometry redone: smaller chevrons, `>` clears the slash by 0.1em | The slash and `>` overlapped and read as one "flag" shape |
| 2026-09-26 | Hero data-structure loop: array → stack pop (b, a, L) → queue enqueue (L, a, b) → linked list → word | User idea; stack first because LIFO takes "Lab" apart backwards and FIFO rebuilds it in order |
| 2026-09-26 | Hero font capped at (100vw - 2rem) / 4.9 + `whitespace-nowrap` | The looser tracking made the word 2px too wide at 390px and the letters wrapped |
| 2026-09-26 | "00 prerequisites to join" is permanent (attendance alternative dropped) + highlighted "Bring your own laptop" strip | User liked it; the laptop tip is the one real ask |
| 2026-09-26 | Session expand: decorations excluded from scroll anchoring; CodeSpace keeps the resting height; clicked header held during the animation; rows on own layers; content fades in place; ScrambleText off React state | Measured before: Chrome anchored to a floating token and scrolled the page (clicked row moved 41–746px, background up to 1,880px). After: row moves ≤1.5px, background still, 60fps desktop + phone; 4x-CPU p95 350→~90ms |
| 2026-09-26 | Mobile pass: code-grid without mask-image; flat projected floor on phones; lvh hero + ignoreMobileResize; row dots positioned from the Reveal box; phone "+" top-right; full-width hook + submit; 44px footer links; 16px inputs; menu backdrop + stagger | Measured on a 390px 3x phone profile: Sessions 61ms avg frames (300ms spikes) and Goals 66ms (768ms) -> all sections ~16.7ms, <=1 late frame per section |
| 2026-09-26 | Phone/tablet navbar gets a compact "✕ Join" button; below sm the wordmark is dropped (mark only) to make room | Join was only reachable through the menu on phones; 27–48px of free space was not enough for it with the wordmark |
| 2026-09-27 | Forms: enrollment required, roll no. optional (hint: 3rd semester+ give the full roll no.), "Branch & year" split into Branch + Year select (even 2x3 grid); feedback "improve" required ("nothing" allowed); full-screen git-commit thank-you takeover after submit | Optional fields get skipped on purpose; a closing moment makes submitting feel received. Apps Script Join columns now: timestamp, intent, name, email, branch, year, enrollment, rollNo, interests, message |
| 2026-09-27 | Alignment pass: intro X centred (brackets hang off it); phone nav gutter 16->20; hero bottom row in the 1400 frame; Sessions column 1120->1200 (= Goals/Footer); grow.yml line breaks only at dots; Goals terminal 360->384px (one-line statuses); session row box 8px from phone edge; equal control heights; branded 404 | Measured: intro X was 14px (1440) / 7px (390) left of CODING CLUB; section headings started at 200 vs 160; default 404 painted the page white |
| 2026-09-27 | Sessions read per request (`connection()` in getSessions) instead of at build; fetch still cached 1h | Docker builds without .env.local (dockerignored, runtime env_file only), so the prerendered home page kept sample sessions forever; verified with a stand-in Google server |
