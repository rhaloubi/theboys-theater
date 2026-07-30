import { z } from "zod";
import mongoose from "mongoose";
import { requireUser } from "@/lib/api/auth-middleware";
import { jsonData, jsonError } from "@/lib/api/response";
import { WATCH_DEDUPE_MS } from "@/lib/constants/profiles";
import { connectDB } from "@/lib/db/mongodb";
import { WatchEvent } from "@/lib/models";

const createHistorySchema = z.object({
  tmdbId: z.number().int().positive(),
  mediaType: z.enum(["movie", "tv"]),
  title: z.string().min(1),
  posterPath: z.string().nullable().optional(),
  backdropPath: z.string().nullable().optional(),
  seasonNumber: z.number().int().nullable().optional(),
  episodeNumber: z.number().int().nullable().optional(),
  episodeTitle: z.string().nullable().optional(),
  progressSeconds: z.number().min(0).optional(),
  durationSeconds: z.number().nullable().optional(),
});

export async function logWatchEvent(body: unknown) {
  const session = await requireUser();
  if (!session.ok) return session.response;

  const parsed = createHistorySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid watch event payload", 400, "VALIDATION_ERROR");
  }

  await connectDB();

  const seasonNumber = parsed.data.seasonNumber ?? null;
  const episodeNumber = parsed.data.episodeNumber ?? null;
  const since = new Date(Date.now() - WATCH_DEDUPE_MS);

  const existing = await WatchEvent.findOne({
    userId: new mongoose.Types.ObjectId(session.user.id),
    tmdbId: parsed.data.tmdbId,
    mediaType: parsed.data.mediaType,
    seasonNumber,
    episodeNumber,
    watchedAt: { $gte: since },
  }).sort({ watchedAt: -1 });

  if (existing) {
    existing.watchedAt = new Date();
    existing.title = parsed.data.title;
    if (parsed.data.posterPath !== undefined) {
      existing.posterPath = parsed.data.posterPath;
    }
    if (parsed.data.backdropPath !== undefined) {
      existing.backdropPath = parsed.data.backdropPath;
    }
    await existing.save();

    return jsonData({
      id: existing._id.toString(),
      watchedAt: existing.watchedAt.toISOString(),
      deduplicated: true,
    });
  }

  const event = await WatchEvent.create({
    userId: session.user.id,
    userSlug: session.user.slug,
    displayName: session.user.displayName,
    ...parsed.data,
    seasonNumber,
    episodeNumber,
    progressSeconds: parsed.data.progressSeconds ?? 0,
    completed: false,
    watchedAt: new Date(),
  });

  return jsonData({
    id: event._id.toString(),
    watchedAt: event.watchedAt.toISOString(),
    deduplicated: false,
  });
}
