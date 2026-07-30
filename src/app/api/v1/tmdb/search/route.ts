import { requireSession } from "@/lib/api/auth-middleware";
import { jsonData, jsonError } from "@/lib/api/response";
import { isTmdbConfigured, tmdbFetchFresh } from "@/lib/tmdb/client";
import {
  mapMultiSearchResults,
  type TmdbMultiSearchResponse,
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

  if (!q || q.length < 2) {
    return jsonError("Query must be at least 2 characters", 400, "VALIDATION_ERROR");
  }

  try {
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
