import { requireUser } from "@/lib/api/auth-middleware";
import { jsonData, jsonError } from "@/lib/api/response";
import { connectDB } from "@/lib/db/mongodb";
import { parseImdbCsv } from "@/lib/imdb/parse-csv";
import { delay, mapImdbToTmdb } from "@/lib/imdb/tmdb-map";
import { isTmdbConfigured } from "@/lib/tmdb/client";
import { ImdbRating, User } from "@/lib/models";

const MAX_FILE_SIZE = 2 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await requireUser();
  if (!session.ok) return session.response;

  if (!isTmdbConfigured()) {
    return jsonError("TMDB is not configured", 503, "TMDB_NOT_CONFIGURED");
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return jsonError("CSV file is required", 400, "VALIDATION_ERROR");
  }

  if (!file.name.toLowerCase().endsWith(".csv")) {
    return jsonError("File must be a .csv", 400, "VALIDATION_ERROR");
  }

  if (file.size > MAX_FILE_SIZE) {
    return jsonError("File too large (max 2MB)", 400, "VALIDATION_ERROR");
  }

  const content = await file.text();
  let rows;
  try {
    rows = parseImdbCsv(content);
  } catch (err) {
    return jsonError(
      err instanceof Error ? err.message : "Invalid CSV",
      400,
      "INVALID_CSV",
    );
  }

  if (rows.length === 0) {
    return jsonError("No ratings found in CSV", 400, "EMPTY_CSV");
  }

  await connectDB();

  let imported = 0;
  const unmappedTitles: string[] = [];

  for (const row of rows) {
    const mapping = await mapImdbToTmdb(row.imdbId);
    await delay(100);

    if (!mapping.tmdbId) {
      unmappedTitles.push(row.title);
    }

    await ImdbRating.findOneAndUpdate(
      { userId: session.user.id, imdbId: row.imdbId },
      {
        userId: session.user.id,
        userSlug: session.user.slug,
        imdbId: row.imdbId,
        tmdbId: mapping.tmdbId,
        mediaType: mapping.mediaType,
        title: row.title,
        year: row.year,
        rating: row.rating,
        ratedAt: row.ratedAt,
        importedAt: new Date(),
      },
      { upsert: true, new: true },
    );
    imported++;
  }

  await User.findByIdAndUpdate(session.user.id, {
    imdbImportUpdatedAt: new Date(),
  });

  return jsonData({
    imported,
    unmapped: unmappedTitles.length,
    unmappedTitles: unmappedTitles.slice(0, 20),
  });
}
