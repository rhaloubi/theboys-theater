import { z } from "zod";
import { requireUser } from "@/lib/api/auth-middleware";
import { jsonData, jsonError, parseJsonBody } from "@/lib/api/response";
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

export async function POST(request: Request) {
  const session = await requireUser();
  if (!session.ok) return session.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof Response) return body;

  const parsed = createHistorySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid watch event payload", 400, "VALIDATION_ERROR");
  }

  await connectDB();

  const event = await WatchEvent.create({
    userId: session.user.id,
    userSlug: session.user.slug,
    displayName: session.user.displayName,
    ...parsed.data,
    progressSeconds: parsed.data.progressSeconds ?? 0,
    completed: false,
    watchedAt: new Date(),
  });

  return jsonData({
    id: event._id.toString(),
    watchedAt: event.watchedAt.toISOString(),
  });
}

export async function GET() {
  return jsonError("Use GET /api/v1/history with query params", 501, "NOT_IMPLEMENTED");
}
