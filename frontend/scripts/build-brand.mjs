/**
 * Regenerates brand assets in public/brand and the favicons in app/.
 *   npm run brand
 * - CodeXLab: SVG + PNG exports of the vector mark (components/logo/geometry.ts)
 * - SOU: splits the official lockup into trimmed seal / wordmark / NAAC pieces (no recoloring)
 */
import { writeFile, readFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const g = await import(pathToFileURL(path.join(root, "components/logo/geometry.ts")).href);
const out = path.join(root, "public/brand");
await mkdir(out, { recursive: true });

const C = { ink: "#262523", ember: "#c9521f", cream: "#f8f4ee", dark: "#1a1917" };

function markSvg({ variant = "mark", tone = "light", bg = null, pad = 0, size = null, radius = 0 }) {
  const [vx, vy, vw, vh] = (variant === "mark" ? g.MARK_VIEWBOX : g.GLYPH_VIEWBOX).split(" ").map(Number);
  const x = vx - pad, y = vy - pad, w = vw + pad * 2, h = vh + pad * 2;
  const ink = tone === "light" ? C.ink : C.cream;
  const dims = size ? ` width="${size[0]}" height="${size[1]}"` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}"${dims}>
${bg ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${bg}"/>` : ""}
<path d="${g.blades.tl}" fill="${ink}"/><path d="${g.blades.bl}" fill="${ink}"/>
<path d="${g.blades.tr}" fill="${C.ember}"/><path d="${g.blades.br}" fill="${C.ember}"/>
<g fill="none" stroke-width="${g.BRACE_W}" stroke-linecap="round" stroke-linejoin="round"><path d="${g.braces.left}" stroke="${ink}"/><path d="${g.braces.right}" stroke="${C.ember}"/></g>
${variant === "mark" ? `<g fill="none" stroke-width="${g.BRACKET_W}" stroke-linecap="round" stroke-linejoin="round"><path d="${g.brackets.lt}" stroke="${ink}"/><path d="${g.brackets.slash}" stroke="${C.ember}"/><path d="${g.brackets.gt}" stroke="${C.ember}"/></g>` : ""}
</svg>
`;
}

const png = (svg, width, file) => sharp(Buffer.from(svg), { density: 600 }).resize({ width }).png({ compressionLevel: 9 }).toFile(file);

// ---- CodeXLab ----
const files = {
  "codexlab-mark.svg": markSvg({ variant: "mark" }),
  "codexlab-mark-dark.svg": markSvg({ variant: "mark", tone: "dark" }),
  "codexlab-glyph.svg": markSvg({ variant: "glyph" }),
  "codexlab-glyph-dark.svg": markSvg({ variant: "glyph", tone: "dark" }),
};
for (const [name, svg] of Object.entries(files)) await writeFile(path.join(out, name), svg);
await png(files["codexlab-mark.svg"], 1600, path.join(out, "codexlab-mark.png"));
await png(files["codexlab-mark-dark.svg"], 1600, path.join(out, "codexlab-mark-dark.png"));
await png(files["codexlab-glyph.svg"], 1024, path.join(out, "codexlab-glyph.png"));

// Favicons: glyph on a cream rounded square
const iconSvg = markSvg({ variant: "glyph", bg: C.cream, pad: 14, radius: 28 });
await writeFile(path.join(root, "app/icon.svg"), iconSvg);
await png(iconSvg, 180, path.join(root, "app/apple-icon.png"));

// ---- Silver Oak University (official artwork: trim + split only) ----
// The original official lockup (the user's first file; preferred over the later "SOU_LOGO_new" version).
const SOU = path.join(root, "brand-source/N SOU X NAAC Logo - N SOU X NAAC Logo.png");
const { data, info } = await sharp(SOU).raw().toBuffer({ resolveWithObject: true });
const alphaAt = (x, y) => data[(y * info.width + x) * 4 + 3];
const colHas = (x) => { for (let y = 0; y < info.height; y++) if (alphaAt(x, y) > 24) return true; return false; };
const segs = []; let s = null;
for (let x = 0; x < info.width; x++) {
  const on = colHas(x);
  if (on && s === null) s = x;
  if (!on && s !== null) { segs.push([s, x - 1]); s = null; }
}
if (s !== null) segs.push([s, info.width - 1]);
const parts = segs.filter(([a, b]) => b - a > 20); // drops the thin divider line
if (parts.length !== 3) throw new Error(`Expected 3 SOU parts, found ${parts.length}`);
const [seal, word, naac] = parts;

async function crop([x0, x1], file) {
  const buf = await sharp(SOU).extract({ left: x0, top: 0, width: x1 - x0 + 1, height: info.height }).png().toBuffer();
  await sharp(buf).trim({ threshold: 1 }).png({ compressionLevel: 9 }).toFile(path.join(out, file));
}
await crop(seal, "sou-seal.png");
await crop(word, "sou-wordmark.png");
await crop(naac, "naac-a.png");
await crop([seal[0], naac[1]], "sou-lockup.png");

// ---- Pixel-exact variants (no browser resampling => no blur) ----
// Each asset is rendered at the exact device-pixel size for every common screen density,
// so a CSS box of W×H shows the file 1:1 at 1x, 1.25x, 1.5x, 1.75x, 2x, 2.5x and 3x.
const DENSITIES = [1, 1.25, 1.5, 1.75, 2, 2.5, 3];
const exactDir = path.join(out, "px");
await mkdir(exactDir, { recursive: true });
const manifest = {};
// ?v=<content hash> on every URL: regenerated art is never served from a stale browser cache.
const v = (buf) => createHash("sha1").update(buf).digest("hex").slice(0, 8);
async function exact(file, cssH) {
  const src = path.join(out, file);
  const m = await sharp(src).metadata();
  // The CSS box must be a whole number of device pixels at EVERY density (x1.25, x1.75 => multiples of 4).
  // A 261px box at 125% is 326.25 device px: the browser then stretches the file by a fraction and
  // the lettering smears. So the box is rounded up to a multiple of 4 and the art is padded, not stretched.
  if (cssH % 4) throw new Error(`cssH ${cssH} must be a multiple of 4`);
  const cssW = Math.ceil((cssH * m.width) / m.height / 4) * 4;
  const base = file.replace(/\.png$/, "");
  const set = [];
  for (const d of DENSITIES) {
    const w = cssW * d, h = cssH * d; // integers by construction
    const iw = Math.round((h * m.width) / m.height); // art at its true aspect ratio
    const padL = Math.floor((w - iw) / 2);
    const name = `${base}-${cssH}@${d}x.png`;
    let img = sharp(await sharp(src).resize(iw, h, { fit: "fill", kernel: "lanczos3" }).png().toBuffer());
    if (d <= 1.5) img = img.sharpen({ sigma: 0.55, m1: 0.6, m2: 1.2 }); // small text needs a touch of edge contrast
    const art = await img.png().toBuffer();
    const buf = await sharp(art)
      .extend({ left: padL, right: w - iw - padL, background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9, palette: false })
      .toBuffer();
    await writeFile(path.join(exactDir, name), buf);
    set.push({ d, src: `/brand/px/${name}?v=${v(buf)}` });
  }
  // full: the trimmed original, for screen densities without a pre-rendered file (browser zoom etc.)
  manifest[`${base}-${cssH}`] = { w: cssW, h: cssH, set, full: `/brand/${file}?v=${v(await readFile(src))}` };
}
await exact("sou-lockup.png", 48); // navbar, sm
await exact("sou-lockup.png", 56); // navbar, md and up
await exact("sou-seal.png", 36); // navbar, phones
await exact("naac-a.png", 36); // navbar, phones

// Footer band: responsive width, so a width-descriptor set.
const footer = [];
const srcW = (await sharp(path.join(out, "sou-lockup.png")).metadata()).width;
for (const w of [...[320, 420, 640, 840, 1260].filter((w) => w < srcW), srcW]) { // never upscale
  const name = `sou-lockup-w${w}.png`;
  const buf = await sharp(path.join(out, "sou-lockup.png")).resize({ width: w, kernel: "lanczos3" }).png({ compressionLevel: 9 }).toBuffer();
  await writeFile(path.join(exactDir, name), buf);
  footer.push({ w, src: `/brand/px/${name}?v=${v(buf)}` });
}
const lm = await sharp(path.join(out, "sou-lockup.png")).metadata();
manifest["sou-lockup-footer"] = { w: lm.width, h: lm.height, set: footer };
await writeFile(path.join(root, "components/logo/brand-px.json"), `${JSON.stringify(manifest, null, 2)}\n`);

for (const f of ["sou-seal.png", "sou-wordmark.png", "naac-a.png", "sou-lockup.png"]) {
  const m = await sharp(path.join(out, f)).metadata();
  console.log(`${f.padEnd(18)} ${m.width}×${m.height}`);
}
console.log("brand assets written to public/brand + app/icon.svg, app/apple-icon.png");
