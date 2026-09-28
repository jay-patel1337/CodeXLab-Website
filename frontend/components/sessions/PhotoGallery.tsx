"use client";

/* eslint-disable @next/next/no-img-element -- remote images from the Sheet (Drive / any host) */
import { useState } from "react";
import { Lightbox } from "./Lightbox";

type Props = { photos: string[]; title: string; sample?: boolean };

const tile =
  "group/photo relative overflow-hidden rounded-xl border border-dark-hairline bg-dark-soft focus-visible:outline-offset-2";

/**
 * Session photos: a large cover plus two side tiles (+N on the last when there are more).
 * With no photos the same grid is shown as reserved frames, so every session has space for them.
 */
export function PhotoGallery({ photos, title, sample = false }: Props) {
  const [open, setOpen] = useState<number | null>(null);
  const shown = photos.slice(0, 3);
  const extra = photos.length - shown.length;

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between font-mono text-xs text-on-dark-soft">
        <span>
          <span className="text-ember">{"//"}</span> photos
        </span>
        <span>{photos.length ? `${photos.length} ${photos.length === 1 ? "file" : "files"}` : "coming soon"}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-6 md:grid-rows-2">
        {[0, 1, 2].map((i) => {
          const src = shown[i];
          const size = i === 0 ? "col-span-2 aspect-[16/10] md:col-span-4 md:row-span-2 md:aspect-auto" : "aspect-[4/3] md:col-span-2";
          if (!src) return <Frame key={i} index={i} className={`${tile} ${size}`} />;
          const last = i === shown.length - 1 && extra > 0;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`Open photo ${i + 1} of ${photos.length} from ${title}`}
              className={`${tile} ${size} cursor-zoom-in`}
            >
              <img
                src={src}
                alt=""
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover/photo:scale-[1.04]"
              />
              {last && (
                <span className="absolute inset-0 grid place-items-center bg-dark/70 font-display text-3xl font-bold text-on-dark">
                  +{extra}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {!photos.length && sample && (
        <p className="mt-3 font-mono text-xs text-on-dark-soft">
          <span className="text-terminal">i</span> add image links to the Sheet&apos;s <span className="text-on-dark">photos</span> column (Drive links work)
        </p>
      )}

      {open !== null && <Lightbox photos={photos} start={open} title={title} onClose={() => setOpen(null)} />}
    </div>
  );
}

/** Reserved photo frame: striped, labelled like a file waiting to be added. */
function Frame({ index, className }: { index: number; className: string }) {
  const name = index === 0 ? "cover.jpg" : `photo_0${index + 1}.jpg`;
  return (
    <div className={`${className} grid place-items-center`} aria-hidden>
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent 0 14px, color-mix(in oklab, var(--color-on-dark) 4%, transparent) 14px 15px)",
        }}
      />
      <span className="absolute inset-3 rounded-lg border border-dashed border-dark-hairline" />
      <span className="relative flex flex-col items-center gap-2 text-on-dark-soft">
        <svg viewBox="0 0 24 24" className={index === 0 ? "h-9 w-9" : "h-6 w-6"} fill="none" stroke="currentColor" strokeWidth={1.4}>
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <circle cx="9" cy="10" r="1.8" />
          <path d="M21 16l-5.2-5.2L8 18.5" strokeLinejoin="round" />
        </svg>
        <span className="font-mono text-[11px] tracking-wide">{name}</span>
      </span>
    </div>
  );
}
