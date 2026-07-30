import { requireSession } from "@/lib/api/auth-middleware";
import { jsonData, jsonError } from "@/lib/api/response";
import { isTmdbConfigured, tmdbFetch } from "@/lib/tmdb/client";
import type { TmdbMovieDetail } from "@/lib/tmdb/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  if (!isTmdbConfigured()) {
    return jsonError("TMDB is not configured", 503, "TMDB_NOT_CONFIGURED");
  }

  const { id } = await params;
  const tmdbId = Number(id);
  if (!Number.isFinite(tmdbId)) {
    return jsonError("Invalid movie id", 400);
  }

  try {
    const movie = await tmdbFetch<TmdbMovieDetail>(`/movie/${tmdbId}`);
    return jsonData({ movie });
  } catch {
    return jsonError("Movie not found", 404);
  }
}
