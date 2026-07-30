import { requireSession } from "@/lib/api/auth-middleware";
import { jsonData, jsonError } from "@/lib/api/response";
import { isTmdbConfigured, tmdbFetch } from "@/lib/tmdb/client";
import type { TmdbTvDetail } from "@/lib/tmdb/types";

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
    return jsonError("Invalid tv id", 400);
  }

  try {
    const show = await tmdbFetch<TmdbTvDetail>(`/tv/${tmdbId}`);
    return jsonData({ show });
  } catch {
    return jsonError("TV show not found", 404);
  }
}
