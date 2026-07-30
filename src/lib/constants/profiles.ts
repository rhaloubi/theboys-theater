export const MAX_PROFILES = 7;

export const PROFILE_AVATAR_COLORS = [
  "#e50914",
  "#0071eb",
  "#46d369",
  "#ffa500",
  "#b469ff",
  "#00bcd4",
  "#ff6b6b",
] as const;

/** Dedupe window for watch events (React Strict Mode double-mount). */
export const WATCH_DEDUPE_MS = 3 * 60 * 1000;
