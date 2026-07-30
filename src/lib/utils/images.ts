const IMAGE_BASE =
  process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE ?? "https://image.tmdb.org/t/p";

export function posterUrl(
  path: string | null | undefined,
  size: "w185" | "w342" | "w500" = "w342",
): string {
  if (!path) return "/placeholder-poster.svg";
  return `${IMAGE_BASE}/${size}${path}`;
}

export function backdropUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return `${IMAGE_BASE}/w1280${path}`;
}

export function titleHref(
  tmdbId: number,
  mediaType: "movie" | "tv",
  seasonNumber?: number | null,
  episodeNumber?: number | null,
): string {
  if (mediaType === "movie") return `/title/movie/${tmdbId}`;
  return `/title/tv/${tmdbId}`;
}

export function watchHref(
  tmdbId: number,
  mediaType: "movie" | "tv",
  seasonNumber?: number | null,
  episodeNumber?: number | null,
): string {
  if (mediaType === "movie") return `/watch/movie/${tmdbId}`;
  const s = seasonNumber ?? 1;
  const e = episodeNumber ?? 1;
  return `/watch/tv/${tmdbId}/${s}/${e}`;
}
