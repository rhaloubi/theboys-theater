import { requireSession } from "@/lib/api/auth-middleware";
import { withErrorHandling } from "@/lib/api/route-handler";
import { jsonData, jsonError } from "@/lib/api/response";
import { isTmdbConfigured, tmdbFetch } from "@/lib/tmdb/client";
import type { TmdbTvSeason } from "@/lib/tmdb/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; season: string }> },
) {
  return withErrorHandling(async () => {
    const session = await requireSession();
    if (!session.ok) return session.response;

    if (!isTmdbConfigured()) {
      return jsonError("TMDB is not configured", 503, "TMDB_NOT_CONFIGURED");
    }

    const { id, season: seasonStr } = await params;
    const tmdbId = Number(id);
    const seasonNumber = Number(seasonStr);

    if (!Number.isFinite(tmdbId) || !Number.isFinite(seasonNumber)) {
      return jsonError("Invalid id or season", 400);
    }

    const season = await tmdbFetch<TmdbTvSeason>(
      `/tv/${tmdbId}/season/${seasonNumber}`,
    );

    return jsonData({ season });
  });
}
