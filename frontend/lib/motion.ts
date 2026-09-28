/** Shared motion tokens (see DESIGN.md → Motion). */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
/** Calm arrivals: slow, short-travel reveals (DESIGN.md → Motion → pacing). */
export const EASE_SOFT = [0.22, 1, 0.36, 1] as const;
/** Things that push the page (expanding rows): gentle start, so a slow first frame can't turn into a jump. */
export const EASE_INOUT = [0.45, 0, 0.15, 1] as const;
export const DUR ={ feedback: 0.12, state: 0.3, layout: 0.6, focal: 1.1 } as const;
