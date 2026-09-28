---
version: 1.0
name: CodeXLab design system
description: Warm cream canvas, graphite type and one ember accent, all taken from the CodeXLab logo. Bold geometric sans for display, JetBrains Mono for the code voice. The logo's four-blade X is the main motion element.

colors:
  ember: "#C9521F"          # logo orange; the X, CTAs, keywords. Use sparingly.
  ember-active: "#A8421A"   # hover / pressed
  ember-text: "#B4451A"     # orange TEXT on cream (AA 5:1). #C9521F is ~4:1, so large text/UI only.
  ink: "#262523"            # logo charcoal; headlines, left blades
  body: "#3D3B38"
  muted: "#6E6A63"
  muted-soft: "#8F8A80"
  canvas: "#F8F4EE"         # logo background; page floor
  surface-card: "#EFE8DD"
  surface-strong: "#E6DDCF"
  hairline: "#E4DCD0"
  dark: "#1A1917"           # sessions band, footer
  dark-elevated: "#262420"
  dark-soft: "#211F1C"
  dark-hairline: "#34312C"
  on-dark: "#F8F4EE"
  on-dark-soft: "#A39F97"
  terminal: "#5DB8A6"       # success lines / info dots only
  error: "#C64545"

typography:
  display: "Outfit 700, tracking -0.04em to -0.055em, leading 0.8–1"
  body: "Outfit 400/500, 15–18px, leading 1.55"
  mono: "JetBrains Mono, used for eyebrows, tags, hashes, tagline, terminal copy"

rounded: { sm: 6px, md: 8px, lg: 12px, pill: 9999px }
spacing: { base: 4px, section: 96–144px, gutter: 20px mobile / 40px desktop, max-width: 1200px }
---

## Overview

CodeXLab is the coding club of Silver Oak University. Everything visual comes from its logo: a cream field, a charcoal and ember X with a `{ }` core, flanked by `<` and `/>`, which reads as the JSX tag `<X/>`. The site should feel like a **warm terminal**: human and student-made, but precise.

**Brand voltage = one ember X on cream.** Ember is scarce on purpose. About 80% of the page is cream, 15% graphite/dark and 5% ember.

Tokens live in `app/globals.css` (`@theme`). Components use Tailwind classes like `bg-canvas` and `text-ember-text`, never raw hex.

## Surfaces and rhythm

Sections alternate: **cream hero → dark Sessions band → cream Goals → dark footer**. Don't put two dark or two cream bands back to back without a reason. Dark bands are for "shipped work" (the git log) and the footer.

## Typography

- **Display: Outfit 700,** tight negative tracking, set big. The hero word runs at `clamp(3.4rem, min(19vw, (100vw - 2rem) / 4.9), 19rem)` (the word is 4.86em wide, so it always fits one line) with `-0.02em` tracking (tighter and the bowls of o/d/e touch); its X stands on the baseline at cap height with even ink gaps to the "e" and "L". Section titles are written as tags, like `<Sessions/>`: the brackets are ember JetBrains Mono and the name is Outfit.
- **Body: Outfit.** 400 for paragraphs, 500 for labels. Keep line length ≤ 65ch.
- **Mono: JetBrains Mono,** for everything that is "code voice":
  - eyebrows (`// what we've shipped so far`)
  - hashes, dates and tags
  - the tagline
  - terminal states (`✔ request received`)
- Never use a serif, and never use Inter.

## The mark

`components/logo/geometry.ts` is the single source for the CodeXLab X. It was measured from `CodeXLab Logo.jpeg` (1 unit ≈ 4px of the source), and the **paths are computed from parameters**: change a number and every blade regenerates.

- **Construction:** the TL→BR diagonal is continuous (graphite, then ember). The TR→BL diagonal is cut by a 4-unit channel running parallel to it.
- **Corners:** flat outer ends; obtuse corners rounded at r 5.5, acute corners at r 1.4.
- **Core:** every blade is **clipped by one circle (r 16)**, so the core is a clean, genuinely empty ring. No tip or corner can poke into it, and it shows whatever background it sits on (cream, card or dark). The braces sit inside: `{` graphite and `}` ember, 2.9 stroke.
- **Brackets:** `<` (graphite) and `/>` (ember) are 3.3-unit round strokes.
- **Every `<` and `/>` on the site** (tag headings, bracket buttons, the hook, the nav Join hover, the cube face) is the `Bracket` component (`components/ui/Bracket.tsx`): the logo's bracket drawn in em units, never a font glyph. Chevrons 0.52em tall, the slash taller (as in the mark), and the `>` always clears the slash by 0.1em (touching, they merge into one shape). Stroke 12 units (13 at small sizes).

**Exports** (`npm run brand` regenerates them all):
- `public/brand/codexlab-mark(.svg|.png|-dark.*)`
- `codexlab-glyph(.svg|.png|-dark.svg)`
- `app/icon.svg` and `app/apple-icon.png`

**Silver Oak University** artwork is official (source: `N SOU X NAAC Logo - N SOU X NAAC Logo.png`, the original lockup), so it is only trimmed and split, never recolored or traced:
- `sou-seal.png`
- `sou-wordmark.png`
- `naac-a.png`
- `sou-lockup.png`

On dark surfaces it always sits on a cream chip.

**Navbar lockup:** `<X/> CodeXLab | official SOU lockup` (seal, name, divider, NAAC A; shown as supplied), 96px tall at the top.
- **On scroll:** the bar eases to 80px (transform only). "CodeXLab" folds into `<X/>` and the SOU lockup slides over. **NAAC is never hidden.**
- **Phones:** seal + NAAC.
- **Below 1024px:** links move into the menu.

## Components

| Component | Where | Notes |
|---|---|---|
| `TagHeading` | section/page titles | `<Name/>`; brackets slide in on view; `level` 1 or 2 |
| `BracketButton` / `BracketLink` | general CTAs | label becomes `<Label/>` on hover/focus; `ember` · `ink` · `ghost` · `dark` |
| `HookButton` | Goals → /join | terminal pill `$ ./experience --codexlab`; parts the X on hover, fills ember and wipes on click |
| Sessions row | Sessions | commit row: hash, date (scramble), title, speaker, tags, expand for details + feedback link |
| Form field | /join, /feedback | label above, hint/error below (mono `! error`), 8px radius, ember focus ring 3px at 15%. Join grid is always an even 2×3: Name/Email, Branch/Year (select), Enrollment no. (required)/Roll no. (optional, hint for 3rd semester+). Feedback "What should we improve?" is required; "nothing" is the accepted opt-out |
| Terminal status | form results | mono line, `text-terminal` for ok and `text-error` for errors |

## Motion

The rule: **one authored moment per surface, and everything else stays quiet and purposeful.**

| Token | Value |
|---|---|
| Ease | `cubic-bezier(0.16, 1, 0.3, 1)` (`--ease-out-expo`, `EASE_OUT` in `lib/motion.ts`) |
| Arrival ease | `cubic-bezier(0.22, 1, 0.36, 1)` (`--ease-soft` / `ease-soft`, `EASE_SOFT`) |
| Arrivals (reveals, page entrance) | 1.2–1.4s, 12–14px travel, 120ms stagger |
| Feedback | 100–150ms (press = `scale(0.98)`) |
| State change | 150–300ms |
| Layout / overlay | 500–1000ms (wipe ≈ 2.2s, shutter ≈ 2.4s end to end) |
| Focal sequence | ≤ 2s total (the intro) |

**Signature moments**
1. **Compile intro** (home, once per browser session):
   - The four blades fly in from the corners on springs.
   - The `{ }` badge stamps in, then `<` and `/>` slide in, and `CODING CLUB` appears between two ember rules.
   - The X then flies into the wordmark (a shared `layoutId`), and `Code` and `Lab` type out from it.
2. **Split the X** (scroll, GSAP ScrollTrigger, pinned):
   - The graphite half and "Code" slide left; the ember half and "Lab" slide right.
   - A dark curtain opens between them (`$ git log --sessions`) and leads into the Sessions band.
3. **X wipe** (every route change: `/join`, `/feedback`; `SectionLink` / `useXWipe`): a graphite band and an ember band cross on the two diagonals, then sweep out.

3b. **Thank-you takeover** (after a successful Join / Feedback submit, `components/forms/ThankYou.tsx`): an ember then a graphite panel sweep up over the page; a terminal types `git commit` / `git push` for the submission (join: "1 club changed, 1 member(+)" → `✔ 201 Created`; feedback: stars as insertions → `✔ 202 Accepted`); an empty fragment `</>` appears and, when the push lands, opens into `<ThankYou/>` (letters fill from the middle out). The form swaps to its done card while covered, the page jumps to the top, and the panels lift (~4.7s). Tap / click / Esc / Enter / Space skips to the exit. Reduced motion: plain fade.

4. **X shutter** (navbar section jumps on the home page, `SectionJump.tsx`):
   - Four dark triangles close in from the screen edges; their seams draw the ember X.
   - A terminal types `cd ~/section`, the page jumps underneath, and the shutter opens.
   - About 2.4s total. The logo link types `cd ~` and goes to the top. From other pages, the X wipe runs and lands on the section.
5. **Code space** (Sessions background, `CodeSpace.tsx`): CSS-3D objects fly in from depth as the section scrolls:
   - a code cube
   - a terminal slab that types the real commits
   - the logo's `{ }` extruded
   - a binary cylinder
   - syntax particles in 3 depth layers
   - a grid floor whose git graph draws itself once

   The big objects only render from 1280px (xl) up. Each has one hover pose (a CSS transition on a wrapper, hit-tested on the untransformed box): the cube turns a quarter, the terminal faces you and prints `whoami`, the braces' extrusion spreads, the cylinder widens. The hero's `scroll --down` cue glides through the split (GSAP ScrollTo, 2.2s).

**Performance rules** (measured; see DECISIONS.md)
- Anything that moves gets a GPU layer (`will-change`) and animates `transform`/`opacity` only.
- **No `clip-path`, `mask-image` or `backdrop-filter` over moving content.** Each forces a repaint or off-screen pass every frame.
- 3D groups end at opacity 1. Below 1, the whole rotating subtree is re-rendered off-screen every frame. Tone comes from colours instead.
- Batch many small movers into a few layers (particles → 3 depth layers).
- Rasters (SOU artwork) are pre-rendered at exact device-pixel sizes (`npm run brand`, `brand-px.json`) and pixel-snapped (`usePixelSnap`). Boxes are multiples of 4 CSS px so they are whole device pixels at every density (x1.25 / x1.75); other densities (browser zoom) get the full-res original in a whole-device-pixel box. URLs carry `?v=<hash>`. Never scale them with CSS transforms.

**Supporting motion**
- The `{ }` badge blinks like a caret.
- Hero blades part magnetically near the mouse (mouse only).
- The nav wordmark collapses to `<X/>` on scroll.
- An ember scroll-progress line runs under the nav.
- Tag brackets slide in on view.
- **Hero wordmark:** the letters unfold out of the X (nearest first, 1.7s CSS keyframe `hero-unfold` on `translate`). Mouse hover lifts a letter and prints its char code above it (`0x43`).
- **Hero data-structure loop** (`useWordLoop` + `SlotParts`, GSAP): array (cells + indices, caption `const club = [..."CodeXLab"]`) → stack `pop()` ×3 lifts b, a, L → queue `enqueue()` slides L, a, b back in from the rear → the cells separate into linked-list nodes with next-pointers, `head` and `→ null` → back to the word. ~24s run, 6s of plain wordmark between runs. Runs only at the top of the page with the hero visible; any scroll settles it to rest in 0.5s; off with reduced motion. Each run is a fresh, freshly measured timeline.
- **Highlighter:** a key phrase gets an ember/45 marker that sweeps in (`scale-x`, 1.2s, after the stats decode). Used once, for "Bring your own laptop"; keep it rare.
- **Expanding rows** use `EASE_INOUT` for height (a gentle start hides the heavy mount frame; an ease-out turned it into a jump), a 60ms delay, and the content fades in place (opacity only, on its own layer). Rows animate `layout="position"` only.
- **Alignment rules** (measured 360 → 1680px; keep them):
  - Gutters: 20px on phones (`px-5`), 40px from md (`md:px-10`), everywhere, navbar included.
  - Two frames: the navbar and the hero's bottom row share `max-w-[1400px]`; every content section (Sessions, Goals, Footer) shares `max-w-[1200px]`, so their headings start on one line. Form pages use narrower centred columns (/join 920, /feedback 760, 404 920).
  - Centred compositions centre the focal element, not the row: the intro's `<` and `/>` differ in width, so they hang off the X (absolute) instead of sitting beside it in a flex row.
  - Long mono meta lines break only at their `·` separators (each "n label ·" is nowrap; the space after it is not).
  - Single-line form controls share one height (48px phones, 44px from sm), native selects included.
- **Phone rules** (measured at 3x density; keep them):
  - No `mask-image` on large elements: `.code-grid` fades with a canvas-coloured gradient painted over the lines. The mask's off-screen pass over the 3500px Goals section made scrolling stutter.
  - No big 3D layers on phones: the Sessions floor is a flat SVG projected through the same transform (`FlatFloor`); the real 3D plane renders from `md`.
  - Hero height is `.hero-h` (100lvh with the toolbar's height kept clear at the bottom) and ScrollTrigger ignores mobile toolbar resizes, so nothing jumps when the toolbar slides away.
  - Thumb targets ≥ 44px (footer links, the scroll cue via an `::after` pad), inputs 16px (iOS zooms smaller ones), primary buttons full width, no grey tap flash but visible `:active` states.
  - The phone menu dims the page (tap to close) and its links drift in one after another.
  - Navbar below lg: a compact dark **✕ Join** button sits beside the menu button (hidden on /join). Below sm the navbar shows the X mark without the "CodeXLab" wordmark to make room (the hero spells the name out); SOU seal + NAAC always stay.
- **Expand stability rules** (measured, keep them): the clicked row's header is held on screen while rows open/close around it (`useHold` in SessionsLog: corrects after motion's writes, before paint; lets go on any wheel/touch/key/pointer input); each row is its own compositing layer (`will-change-transform`); decoration layers carry `overflow-anchor: none` (the browser must never anchor scrolling to a floating token); the Sessions 3D space keeps the section's *resting* height (open row bodies subtracted), so opening a row never moves the background; ScrambleText writes to the DOM, not React state.
- Session dates scramble-decode.
- Nav **Join the club**: the X stays still; the label rolls up into `<Join/>` with a caret and an ember line sweeps the bottom edge.
- `/join` and `/feedback` fields drift in one by one (`.page-enter`).
- **Goals pipeline** (`Goals.tsx`): the goals are stages of `grow.yml`. A stage runs when it scrolls in, then settles (passed / running / queued); an ember rail fills with scroll; a sticky run log mirrors it on desktop; the last stage, `deploy`, waits for a runner (the hook button).

**Pacing**: arrivals are slow and short-travel (calm, not popping). Hover and press feedback stay fast.

**Rules**
- Animate `transform` and `opacity` only (static `clip-path` shapes are fine).
- `prefers-reduced-motion` skips the intro, the split and the typing. The page shows its finished state.
- Content is visible without JS. Hidden-until-revealed states only apply under `html.js`.

## Do / Don't

- **Do** keep ember for the X, the primary CTA, keywords (`SOU`, `Future`) and active states.
- **Do** write UI copy in the club's voice: short, a little playful, Hinglish where it fits the tagline.
- **Don't** add the SOU maroon/green to the palette. The SOU × NAAC lockup appears as-is on a cream chip.
- **Don't** use pure black or white, neon glows, gradient text or emoji.
- **Don't** use the "3 equal cards" feature row.
