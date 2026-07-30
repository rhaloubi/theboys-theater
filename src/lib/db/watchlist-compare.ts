import { connectDB } from "@/lib/db/mongodb";
import { User, Watchlist } from "@/lib/models";
import type { WatchlistCompareResponse, WatchlistItem } from "@/lib/types";

function toWatchlistItem(doc: {
  tmdbId: number;
  mediaType: string;
  title: string;
  posterPath?: string | null;
  addedAt: Date;
  source?: string;
}): WatchlistItem {
  return {
    tmdbId: doc.tmdbId,
    mediaType: doc.mediaType as "movie" | "tv",
    title: doc.title,
    posterPath: doc.posterPath ?? null,
    addedAt: doc.addedAt.toISOString(),
    source: doc.source === "imdb_import" ? "imdb_import" : "manual",
  };
}

export async function getWatchlistCompare(): Promise<WatchlistCompareResponse> {
  await connectDB();

  const users = await User.find().sort({ slug: 1 }).lean();
  const allItems = await Watchlist.find().sort({ addedAt: -1 }).lean();

  const byUser = new Map<string, typeof allItems>();
  for (const user of users) {
    byUser.set(
      user.slug,
      allItems.filter((w) => w.userSlug === user.slug),
    );
  }

  const onlyByUser: Record<string, WatchlistItem[]> = {};
  for (const user of users) {
    onlyByUser[user.slug] = [];
  }

  if (users.length < 2) {
    for (const user of users) {
      onlyByUser[user.slug] = (byUser.get(user.slug) ?? []).map(toWatchlistItem);
    }
    return { shared: [], onlyByUser };
  }

  const [userA, userB] = users;
  const listA = byUser.get(userA.slug) ?? [];
  const listB = byUser.get(userB.slug) ?? [];

  const key = (tmdbId: number, mediaType: string) => `${mediaType}:${tmdbId}`;
  const mapA = new Map(listA.map((w) => [key(w.tmdbId, w.mediaType), w]));
  const mapB = new Map(listB.map((w) => [key(w.tmdbId, w.mediaType), w]));

  const shared: WatchlistItem[] = [];

  for (const [k, itemA] of mapA) {
    if (mapB.has(k)) {
      shared.push(toWatchlistItem(itemA));
    } else {
      onlyByUser[userA.slug].push(toWatchlistItem(itemA));
    }
  }

  for (const [k, itemB] of mapB) {
    if (!mapA.has(k)) {
      onlyByUser[userB.slug].push(toWatchlistItem(itemB));
    }
  }

  return { shared, onlyByUser };
}

export async function getWatchlist(userSlug?: string) {
  await connectDB();
  const filter = userSlug ? { userSlug } : {};
  const items = await Watchlist.find(filter).sort({ addedAt: -1 }).lean();
  return items.map(toWatchlistItem);
}
