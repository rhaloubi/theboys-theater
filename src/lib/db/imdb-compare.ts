import { connectDB } from "@/lib/db/mongodb";
import { ImdbRating, User } from "@/lib/models";
import type {
  CompareUserStats,
  ImdbCompareResponse,
  ImdbRatingItem,
  SharedRatingTitle,
} from "@/lib/types";

function toRatingItem(doc: {
  imdbId: string;
  tmdbId?: number | null;
  mediaType?: string | null;
  title: string;
  year?: number | null;
  rating: number;
  ratedAt?: Date | null;
}): ImdbRatingItem {
  return {
    imdbId: doc.imdbId,
    tmdbId: doc.tmdbId ?? null,
    mediaType:
      doc.mediaType === "movie" || doc.mediaType === "tv"
        ? doc.mediaType
        : null,
    title: doc.title,
    year: doc.year ?? null,
    rating: doc.rating,
    ratedAt: doc.ratedAt?.toISOString() ?? null,
  };
}

export async function getImdbCompare(): Promise<ImdbCompareResponse> {
  await connectDB();

  const users = await User.find().sort({ slug: 1 }).lean();
  const allRatings = await ImdbRating.find().lean();

  const byUser = new Map<string, typeof allRatings>();
  for (const user of users) {
    byUser.set(
      user.slug,
      allRatings.filter((r) => r.userSlug === user.slug),
    );
  }

  const userStats: CompareUserStats[] = users.map((user) => {
    const ratings = byUser.get(user.slug) ?? [];
    const avg =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;
    return {
      slug: user.slug,
      displayName: user.displayName,
      avatarColor: user.avatarColor ?? "#e50914",
      avgRating: Math.round(avg * 10) / 10,
      totalRated: ratings.length,
    };
  });

  if (users.length < 2) {
    return {
      users: userStats,
      sharedTitles: [],
      biggestAgreements: [],
      biggestDisagreements: [],
      onlyRatedByUser: Object.fromEntries(
        users.map((u) => [
          u.slug,
          (byUser.get(u.slug) ?? []).map(toRatingItem),
        ]),
      ),
    };
  }

  const [userA, userB] = users;
  const ratingsA = byUser.get(userA.slug) ?? [];
  const ratingsB = byUser.get(userB.slug) ?? [];

  const mapA = new Map(ratingsA.map((r) => [r.imdbId, r]));
  const mapB = new Map(ratingsB.map((r) => [r.imdbId, r]));

  const sharedTitles: SharedRatingTitle[] = [];
  const onlyRatedByUser: Record<string, ImdbRatingItem[]> = {
    [userA.slug]: [],
    [userB.slug]: [],
  };

  for (const [imdbId, ratingA] of mapA) {
    const ratingB = mapB.get(imdbId);
    if (ratingB) {
      const diff = Math.abs(ratingA.rating - ratingB.rating);
      sharedTitles.push({
        tmdbId: ratingA.tmdbId ?? ratingB.tmdbId ?? null,
        imdbId,
        title: ratingA.title,
        mediaType:
          ratingA.mediaType === "movie" || ratingA.mediaType === "tv"
            ? ratingA.mediaType
            : ratingB.mediaType === "movie" || ratingB.mediaType === "tv"
              ? ratingB.mediaType
              : null,
        posterPath: null,
        ratings: {
          [userA.slug]: ratingA.rating,
          [userB.slug]: ratingB.rating,
        },
        diff,
      });
    } else {
      onlyRatedByUser[userA.slug].push(toRatingItem(ratingA));
    }
  }

  for (const [imdbId, ratingB] of mapB) {
    if (!mapA.has(imdbId)) {
      onlyRatedByUser[userB.slug].push(toRatingItem(ratingB));
    }
  }

  sharedTitles.sort((a, b) => b.diff - a.diff);

  const biggestAgreements = sharedTitles.filter(
    (t) => t.diff <= 1 && Object.values(t.ratings).every((r) => r >= 8),
  );

  const biggestDisagreements = sharedTitles.filter((t) => t.diff >= 4);

  return {
    users: userStats,
    sharedTitles,
    biggestAgreements,
    biggestDisagreements,
    onlyRatedByUser,
  };
}

export async function getImdbRatings(userSlug?: string) {
  await connectDB();
  const filter = userSlug ? { userSlug } : {};
  const ratings = await ImdbRating.find(filter)
    .sort({ rating: -1, title: 1 })
    .lean();

  return ratings.map(toRatingItem);
}
