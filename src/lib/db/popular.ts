import mongoose from "mongoose";
import { connectDB } from "@/lib/db/mongodb";
import { WatchEvent } from "@/lib/models";
import { tmdbFetch } from "@/lib/tmdb/client";
import {
  mapTmdbPopularToRow,
  type TmdbPagedResults,
} from "@/lib/tmdb/types";
import type { PopularRowItem } from "@/lib/types";

const DEFAULT_LIMIT = 20;

type AggRow = {
  _id: {
    tmdbId: number;
    mediaType: "movie" | "tv";
    seasonNumber?: number | null;
    episodeNumber?: number | null;
  };
  watchCount?: number;
  title: string;
  posterPath: string | null;
  lastWatchedAt: Date;
  lastWatchedBy: string;
  progressSeconds?: number;
  seasonNumber?: number | null;
  episodeNumber?: number | null;
};

function mapAgg(row: AggRow): PopularRowItem {
  return {
    tmdbId: row._id.tmdbId,
    mediaType: row._id.mediaType,
    title: row.title,
    posterPath: row.posterPath,
    watchCount: row.watchCount ?? 1,
    lastWatchedAt: row.lastWatchedAt.toISOString(),
    lastWatchedBy: row.lastWatchedBy,
    progressSeconds: row.progressSeconds,
    seasonNumber: row.seasonNumber ?? row._id.seasonNumber ?? null,
    episodeNumber: row.episodeNumber ?? row._id.episodeNumber ?? null,
  };
}

async function tmdbFallback(limit: number): Promise<PopularRowItem[]> {
  try {
    const [movies, tv] = await Promise.all([
      tmdbFetch<TmdbPagedResults<{ id: number; title: string; poster_path: string | null }>>(
        "/movie/popular",
        { page: 1 },
      ),
      tmdbFetch<TmdbPagedResults<{ id: number; name: string; poster_path: string | null }>>(
        "/tv/popular",
        { page: 1 },
      ),
    ]);

    const half = Math.ceil(limit / 2);
    return [
      ...mapTmdbPopularToRow(movies.results.slice(0, half), "movie"),
      ...mapTmdbPopularToRow(tv.results.slice(0, half), "tv"),
    ].slice(0, limit);
  } catch {
    return [];
  }
}

async function withFallback(
  items: PopularRowItem[],
  limit: number,
): Promise<{ items: PopularRowItem[]; isFallback: boolean }> {
  if (items.length > 0) {
    return { items, isFallback: false };
  }
  const fallback = await tmdbFallback(limit);
  return { items: fallback, isFallback: true };
}

export async function getMostWatched(limit = DEFAULT_LIMIT) {
  await connectDB();

  const rows = await WatchEvent.aggregate<AggRow>([
    {
      $group: {
        _id: { tmdbId: "$tmdbId", mediaType: "$mediaType" },
        watchCount: { $sum: 1 },
        title: { $first: "$title" },
        posterPath: { $first: "$posterPath" },
        lastWatchedAt: { $max: "$watchedAt" },
        lastWatchedBy: { $last: "$displayName" },
      },
    },
    { $sort: { watchCount: -1, lastWatchedAt: -1 } },
    { $limit: limit },
  ]);

  return withFallback(rows.map(mapAgg), limit);
}

export async function getThisWeek(limit = DEFAULT_LIMIT) {
  await connectDB();
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const rows = await WatchEvent.aggregate<AggRow>([
    { $match: { watchedAt: { $gte: since } } },
    {
      $group: {
        _id: { tmdbId: "$tmdbId", mediaType: "$mediaType" },
        watchCount: { $sum: 1 },
        title: { $first: "$title" },
        posterPath: { $first: "$posterPath" },
        lastWatchedAt: { $max: "$watchedAt" },
        lastWatchedBy: { $last: "$displayName" },
      },
    },
    { $sort: { watchCount: -1, lastWatchedAt: -1 } },
    { $limit: limit },
  ]);

  return withFallback(rows.map(mapAgg), limit);
}

export async function getRecent(limit = DEFAULT_LIMIT) {
  await connectDB();

  const rows = await WatchEvent.aggregate<AggRow>([
    { $sort: { watchedAt: -1 } },
    {
      $group: {
        _id: { tmdbId: "$tmdbId", mediaType: "$mediaType" },
        watchCount: { $sum: 1 },
        title: { $first: "$title" },
        posterPath: { $first: "$posterPath" },
        lastWatchedAt: { $first: "$watchedAt" },
        lastWatchedBy: { $first: "$displayName" },
      },
    },
    { $sort: { lastWatchedAt: -1 } },
    { $limit: limit },
  ]);

  return withFallback(rows.map(mapAgg), limit);
}

export async function getFriendActivity(
  currentUserSlug: string,
  limit = DEFAULT_LIMIT,
) {
  await connectDB();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const rows = await WatchEvent.aggregate<AggRow>([
    {
      $match: {
        userSlug: { $ne: currentUserSlug },
        watchedAt: { $gte: since },
      },
    },
    { $sort: { watchedAt: -1 } },
    {
      $group: {
        _id: { tmdbId: "$tmdbId", mediaType: "$mediaType" },
        watchCount: { $sum: 1 },
        title: { $first: "$title" },
        posterPath: { $first: "$posterPath" },
        lastWatchedAt: { $first: "$watchedAt" },
        lastWatchedBy: { $first: "$displayName" },
      },
    },
    { $limit: limit },
  ]);

  if (rows.length === 0) {
    const allFriend = await WatchEvent.aggregate<AggRow>([
      { $match: { userSlug: { $ne: currentUserSlug } } },
      { $sort: { watchedAt: -1 } },
      {
        $group: {
          _id: { tmdbId: "$tmdbId", mediaType: "$mediaType" },
          watchCount: { $sum: 1 },
          title: { $first: "$title" },
          posterPath: { $first: "$posterPath" },
          lastWatchedAt: { $first: "$watchedAt" },
          lastWatchedBy: { $first: "$displayName" },
        },
      },
      { $limit: limit },
    ]);
    return { items: allFriend.map(mapAgg), isFallback: false };
  }

  return { items: rows.map(mapAgg), isFallback: false };
}

export async function getContinueWatching(
  userId: string,
  limit = DEFAULT_LIMIT,
) {
  await connectDB();

  const rows = await WatchEvent.aggregate<AggRow>([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        completed: false,
        progressSeconds: { $gt: 0 },
      },
    },
    { $sort: { watchedAt: -1 } },
    {
      $group: {
        _id: {
          tmdbId: "$tmdbId",
          mediaType: "$mediaType",
          seasonNumber: "$seasonNumber",
          episodeNumber: "$episodeNumber",
        },
        watchCount: { $sum: 1 },
        title: { $first: "$title" },
        posterPath: { $first: "$posterPath" },
        lastWatchedAt: { $first: "$watchedAt" },
        lastWatchedBy: { $first: "$displayName" },
        progressSeconds: { $first: "$progressSeconds" },
        seasonNumber: { $first: "$seasonNumber" },
        episodeNumber: { $first: "$episodeNumber" },
      },
    },
    { $limit: limit },
  ]);

  return { items: rows.map(mapAgg), isFallback: false };
}
