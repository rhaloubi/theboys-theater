import mongoose from "mongoose";
import { requireSession } from "@/lib/api/auth-middleware";
import { logWatchEvent } from "@/lib/api/history-log";
import { withErrorHandling } from "@/lib/api/route-handler";
import { jsonData, parseJsonBody } from "@/lib/api/response";
import { connectDB } from "@/lib/db/mongodb";
import { User, WatchEvent } from "@/lib/models";
import type { HistoryItem } from "@/lib/types";

export async function POST(request: Request) {
  const body = await parseJsonBody<unknown>(request);
  if (body instanceof Response) return body;
  return withErrorHandling(() => logWatchEvent(body));
}

export async function GET(request: Request) {
  return withErrorHandling(async () => {
    const session = await requireSession();
    if (!session.ok) return session.response;

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? "50"), 100);
    const cursor = searchParams.get("cursor");
    const userSlug = searchParams.get("userSlug")?.trim();

    await connectDB();

    const users = await User.find().lean();
    const avatarBySlug = new Map(
      users.map((u) => [u.slug, u.avatarColor ?? "#e50914"]),
    );

    const filter: Record<string, unknown> = {};
    if (userSlug) filter.userSlug = userSlug;
    if (cursor) {
      filter._id = { $lt: new mongoose.Types.ObjectId(cursor) };
    }

    const events = await WatchEvent.find(filter)
      .sort({ watchedAt: -1, _id: -1 })
      .limit(limit + 1)
      .lean();

    const hasMore = events.length > limit;
    const slice = hasMore ? events.slice(0, limit) : events;

    const items: HistoryItem[] = slice.map((event) => ({
      id: event._id.toString(),
      userSlug: event.userSlug,
      displayName: event.displayName,
      avatarColor: avatarBySlug.get(event.userSlug) ?? "#e50914",
      tmdbId: event.tmdbId,
      mediaType: event.mediaType as "movie" | "tv",
      title: event.title,
      posterPath: event.posterPath ?? null,
      seasonNumber: event.seasonNumber ?? null,
      episodeNumber: event.episodeNumber ?? null,
      episodeTitle: event.episodeTitle ?? null,
      watchedAt: event.watchedAt.toISOString(),
      completed: event.completed ?? false,
    }));

    return jsonData({
      items,
      nextCursor: hasMore ? slice[slice.length - 1]._id.toString() : null,
    });
  });
}
