import "server-only";
import { connection } from "next/server";
import { parseCsv } from "./csv";
import fallback from "@/data/sessions.fallback.json";

export type Session = {
  id: string;
  hash: string;
  date: string; // ISO yyyy-mm-dd
  title: string;
  speaker: string;
  tags: string[];
  summary: string;
  attendees: number | null;
  /** Cover first, then the rest. Empty = the detail view shows reserved photo frames. */
  photos: string[];
  resourcesUrl: string;
};

export type SessionsResult = { sessions: Session[]; source: "sheet" | "sample" };

function shortHash(input: string) {
  let h = 2166136261;
  for (const ch of input) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return (h >>> 0).toString(16).padStart(8, "0").slice(0, 7);
}

function normalize(raw: Record<string, string>): Session | null {
  const title = raw.title?.trim();
  const date = raw.date?.trim();
  if (!title || !date) return null;
  const status = (raw.status ?? "").toLowerCase();
  if (status === "draft" || status === "hidden") return null;
  const id = raw.id?.trim() || `${date}-${title}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const attendees = Number.parseInt(raw.attendees ?? "", 10);
  return {
    id,
    hash: shortHash(id),
    date,
    title,
    speaker: raw.speaker ?? "",
    tags: (raw.tags ?? "").split(/[,|]/).map((t) => t.trim()).filter(Boolean),
    summary: raw.summary ?? "",
    attendees: Number.isFinite(attendees) ? attendees : null,
    photos: Array.from(new Set([...splitLinks(raw.cover_image_url), ...splitLinks(raw.photos)])),
    resourcesUrl: raw.resources_url ?? "",
  };
}

const byDateDesc = (a: Session, b: Session) => b.date.localeCompare(a.date);

/**
 * Accepts direct image URLs and Google Drive share links (…/file/d/<id>/view, open?id=<id>, uc?id=<id>),
 * turning Drive links into direct image URLs. Files must be shared as "Anyone with the link".
 */
export function toImageUrl(raw: string): string {
  const url = raw.trim();
  if (!url) return "";
  const drive = url.match(/drive\.google\.com\/(?:file\/d\/([\w-]+)|(?:open|uc)\?(?:.*&)?id=([\w-]+))/);
  if (drive) return `https://lh3.googleusercontent.com/d/${drive[1] ?? drive[2]}=w1600`;
  return url;
}

/** Splits a cell of links on new lines, "|" or ", " (commas inside URLs are left alone). */
function splitLinks(cell = "") {
  return cell
    .split(/\r?\n|\||,\s+/)
    .map(toImageUrl)
    .filter((u) => /^https?:\/\//.test(u));
}

function sample(): SessionsResult {
  const sessions = (fallback as Record<string, string>[])
    .map(normalize)
    .filter((s): s is Session => s !== null)
    .sort(byDateDesc);
  return { sessions, source: "sample" };
}

/** Reads the published Google Sheet CSV (cached for an hour). Falls back to local sample data. */
export async function getSessions(): Promise<SessionsResult> {
  // Read the URL per request, not at build time: the Docker build never sees .env.local (it's only
  // passed to the running container), so a prerendered page would keep the sample sessions forever.
  // The fetch below still hits Google at most once an hour.
  await connection();
  const url = process.env.SESSIONS_CSV_URL;
  if (!url) return sample();
  try {
    const res = await fetch(url, { next: { revalidate: 3600, tags: ["sessions"] } });
    if (!res.ok) throw new Error(`Sheet responded ${res.status}`);
    const sessions = parseCsv(await res.text())
      .map(normalize)
      .filter((s): s is Session => s !== null)
      .sort(byDateDesc);
    return { sessions, source: "sheet" };
  } catch (err) {
    console.error("[sessions] falling back to sample data:", err);
    return sample();
  }
}
