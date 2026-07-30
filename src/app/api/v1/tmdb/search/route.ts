import { requireSession } from "@/lib/api/auth-middleware";
import { jsonData, jsonError } from "@/lib/api/response";
import { isTmdbConfigured, tmdbFetchFresh } from "@/lib/tmdb/client";
import {
  mapMovieSearchResults,
  mapMultiSearchResults,
  mapTvSearchResults,
  type SearchMediaFilter,
  type TmdbMultiSearchResponse,
  type TmdbPagedResults,
} from "@/lib/tmdb/types";

export async function GET(request: Request) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  if (!isTmdbConfigured()) {
    return jsonError("TMDB is not configured", 503, "TMDB_NOT_CONFIGURED");
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const page = Number(searchParams.get("page") ?? "1");
  const type = searchParams.get("type") as SearchMediaFilter | null;

  if (!q || q.length < 2) {
    return jsonError("Query must be at least 2 characters", 400, "VALIDATION_ERROR");
  }

  try {
    if (type === "movie") {
      const data = await tmdbFetchFresh<
        TmdbPagedResults<{
          id: number;
          title: string;
          poster_path?: string | null;
          release_date?: string;
          overview?: string;
        }>
      >("/search/movie", { query: q, page, include_adult: "false" });

      return jsonData({
        results: mapMovieSearchResults(data),
        page,
        totalPages: data.total_pages,
        totalResults: data.total_results,
      });
    }

    if (type === "tv") {
      const data = await tmdbFetchFresh<
        TmdbPagedResults<{
          id: number;
          name: string;
          poster_path?: string | null;
          first_air_date?: string;
          overview?: string;
        }>
      >("/search/tv", { query: q, page, include_adult: "false" });

      return jsonData({
        results: mapTvSearchResults(data),
        page,
        totalPages: data.total_pages,
        totalResults: data.total_results,
      });
    }

    const data = await tmdbFetchFresh<TmdbMultiSearchResponse>("/search/multi", {
      query: q,
      page,
      include_adult: "false",
    });

    return jsonData({
      results: mapMultiSearchResults(data),
      page: data.total_pages ? page : 1,
      totalPages: data.total_pages,
      totalResults: data.total_results,
    });
  } catch {
    return jsonError("Search failed", 502, "TMDB_ERROR");
  }
}
