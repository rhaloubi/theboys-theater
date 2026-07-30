import { z } from "zod";
import { requireUser } from "@/lib/api/auth-middleware";
import { withErrorHandling } from "@/lib/api/route-handler";
import { jsonData, jsonError, parseJsonBody } from "@/lib/api/response";
import { getWatchlist } from "@/lib/db/watchlist-compare";
import { connectDB } from "@/lib/db/mongodb";
import { Watchlist } from "@/lib/models";

const addSchema = z.object({
  tmdbId: z.number().int().positive(),
  mediaType: z.enum(["movie", "tv"]),
  title: z.string().min(1),
  posterPath: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export async function GET(request: Request) {
  return withErrorHandling(async () => {
    const session = await requireUser();
    if (!session.ok) return session.response;

    const { searchParams } = new URL(request.url);
    const userSlug = searchParams.get("userSlug") ?? session.user.slug;

    const items = await getWatchlist(userSlug);
    return jsonData({ items });
  });
}

export async function POST(request: Request) {
  const body = await parseJsonBody<unknown>(request);
  if (body instanceof Response) return body;

  return withErrorHandling(async () => {
    const session = await requireUser();
    if (!session.ok) return session.response;

    const parsed = addSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Invalid watchlist item", 400, "VALIDATION_ERROR");
    }

    await connectDB();

    const item = await Watchlist.findOneAndUpdate(
      {
        userId: session.user.id,
        tmdbId: parsed.data.tmdbId,
        mediaType: parsed.data.mediaType,
      },
      {
        userId: session.user.id,
        userSlug: session.user.slug,
        tmdbId: parsed.data.tmdbId,
        mediaType: parsed.data.mediaType,
        title: parsed.data.title,
        posterPath: parsed.data.posterPath ?? null,
        notes: parsed.data.notes ?? null,
        source: "manual",
        addedAt: new Date(),
      },
      { upsert: true, new: true },
    );

    return jsonData({
      item: {
        tmdbId: item.tmdbId,
        mediaType: item.mediaType,
        title: item.title,
        posterPath: item.posterPath ?? null,
        addedAt: item.addedAt.toISOString(),
        source: "manual" as const,
      },
    });
  });
}
