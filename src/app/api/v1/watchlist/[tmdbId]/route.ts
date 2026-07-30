import { requireUser } from "@/lib/api/auth-middleware";
import { jsonData, jsonError } from "@/lib/api/response";
import { connectDB } from "@/lib/db/mongodb";
import { Watchlist } from "@/lib/models";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tmdbId: string }> },
) {
  const session = await requireUser();
  if (!session.ok) return session.response;

  const { tmdbId: tmdbIdStr } = await params;
  const tmdbId = Number(tmdbIdStr);
  if (!Number.isFinite(tmdbId)) {
    return jsonError("Invalid tmdbId", 400);
  }

  const { searchParams } = new URL(request.url);
  const mediaType = searchParams.get("mediaType");
  if (mediaType !== "movie" && mediaType !== "tv") {
    return jsonError("mediaType query param required (movie|tv)", 400);
  }

  await connectDB();

  await Watchlist.deleteOne({
    userId: session.user.id,
    tmdbId,
    mediaType,
  });

  return jsonData({ success: true });
}
