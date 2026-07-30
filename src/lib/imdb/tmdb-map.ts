import { tmdbFetchFresh } from "@/lib/tmdb/client";
import type { MediaType } from "@/lib/types";

interface TmdbFindResponse {
  movie_results: Array<{ id: number; poster_path: string | null }>;
  tv_results: Array<{ id: number; poster_path: string | null }>;
}

export interface TmdbMapping {
  tmdbId: number | null;
  mediaType: MediaType | null;
  posterPath: string | null;
}

export async function mapImdbToTmdb(imdbId: string): Promise<TmdbMapping> {
  try {
    const data = await tmdbFetchFresh<TmdbFindResponse>(`/find/${imdbId}`, {
      external_source: "imdb_id",
    });

    if (data.movie_results?.[0]) {
      return {
        tmdbId: data.movie_results[0].id,
        mediaType: "movie",
        posterPath: data.movie_results[0].poster_path ?? null,
      };
    }

    if (data.tv_results?.[0]) {
      return {
        tmdbId: data.tv_results[0].id,
        mediaType: "tv",
        posterPath: data.tv_results[0].poster_path ?? null,
      };
    }

    return { tmdbId: null, mediaType: null, posterPath: null };
  } catch {
    return { tmdbId: null, mediaType: null, posterPath: null };
  }
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
