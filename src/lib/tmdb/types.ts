export interface TmdbSearchResult {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
  overview: string | null;
}

export interface TmdbMultiSearchResponse {
  results: Array<{
    id: number;
    media_type?: string;
    title?: string;
    name?: string;
    poster_path?: string | null;
    release_date?: string;
    first_air_date?: string;
    overview?: string;
  }>;
  total_pages: number;
  total_results: number;
}

export interface TmdbPagedResults<T> {
  results: T[];
  page: number;
  total_pages: number;
  total_results: number;
}

export interface TmdbMovieDetail {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number | null;
  vote_average: number;
  genres: Array<{ id: number; name: string }>;
}

export interface TmdbTvDetail {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  genres: Array<{ id: number; name: string }>;
  number_of_seasons: number;
  seasons: Array<{
    id: number;
    season_number: number;
    name: string;
    episode_count: number;
    poster_path: string | null;
  }>;
}

export interface TmdbTvSeason {
  id: number;
  season_number: number;
  name: string;
  episodes: Array<{
    id: number;
    episode_number: number;
    name: string;
    overview: string;
    still_path: string | null;
    runtime: number | null;
  }>;
}

export type SearchMediaFilter = "movie" | "tv";

export function mapMovieSearchResults(
  data: TmdbPagedResults<{
    id: number;
    title: string;
    poster_path?: string | null;
    release_date?: string;
    overview?: string;
  }>,
): TmdbSearchResult[] {
  return data.results.map((item) => ({
    tmdbId: item.id,
    mediaType: "movie" as const,
    title: item.title,
    posterPath: item.poster_path ?? null,
    releaseDate: item.release_date ?? null,
    overview: item.overview ?? null,
  }));
}

export function mapTvSearchResults(
  data: TmdbPagedResults<{
    id: number;
    name: string;
    poster_path?: string | null;
    first_air_date?: string;
    overview?: string;
  }>,
): TmdbSearchResult[] {
  return data.results.map((item) => ({
    tmdbId: item.id,
    mediaType: "tv" as const,
    title: item.name,
    posterPath: item.poster_path ?? null,
    releaseDate: item.first_air_date ?? null,
    overview: item.overview ?? null,
  }));
}

export function mapMultiSearchResults(
  data: TmdbMultiSearchResponse,
): TmdbSearchResult[] {
  return data.results
    .filter((item) => item.media_type === "movie" || item.media_type === "tv")
    .map((item) => ({
      tmdbId: item.id,
      mediaType: item.media_type as "movie" | "tv",
      title: item.title ?? item.name ?? "Unknown",
      posterPath: item.poster_path ?? null,
      releaseDate: item.release_date ?? item.first_air_date ?? null,
      overview: item.overview ?? null,
    }));
}

export function mapTmdbPopularToRow(
  items: Array<{
    id: number;
    title?: string;
    name?: string;
    poster_path?: string | null;
  }>,
  mediaType: "movie" | "tv",
) {
  return items.map((item) => ({
    tmdbId: item.id,
    mediaType,
    title: item.title ?? item.name ?? "Unknown",
    posterPath: item.poster_path ?? null,
    watchCount: 0,
    lastWatchedAt: new Date().toISOString(),
    lastWatchedBy: "",
  }));
}
