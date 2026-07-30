"use client";

import Link from "next/link";
import Image from "next/image";
import { useInfiniteQuery } from "@tanstack/react-query";
import { historyApi } from "@/lib/api/client";
import { posterUrl, watchHref } from "@/lib/utils/images";
import {
  formatEpisodeLabel,
  formatRelativeTime,
} from "@/lib/utils/time";

export function ActivityFeed() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["history"],
      queryFn: ({ pageParam }) => historyApi.list({ cursor: pageParam }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (last) => last.nextCursor ?? undefined,
      staleTime: 15_000,
    });

  const items = data?.pages.flatMap((p) => p.items) ?? [];

  if (isLoading) {
    return <p className="text-muted text-sm">Loading activity…</p>;
  }

  if (items.length === 0) {
    return (
      <p className="text-muted text-sm">
        No watches yet. Play something and it&apos;ll show up here for both of
        you.
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {items.map((item) => {
        const episode = formatEpisodeLabel(
          item.seasonNumber,
          item.episodeNumber,
          item.episodeTitle,
        );
        const href =
          item.mediaType === "movie"
            ? watchHref(item.tmdbId, "movie")
            : watchHref(
                item.tmdbId,
                "tv",
                item.seasonNumber,
                item.episodeNumber,
              );

        return (
          <Link
            key={item.id}
            href={href}
            className="flex items-center gap-4 rounded-lg border border-border/50 bg-surface/50 px-4 py-3 transition-colors hover:bg-surface"
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: item.avatarColor }}
            >
              {item.displayName.charAt(0).toUpperCase()}
            </span>

            <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-sm bg-surface">
              <Image
                src={posterUrl(item.posterPath, "w185")}
                alt=""
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm">
                <span className="font-semibold">{item.displayName}</span>
                {" watched "}
                <span className="font-medium text-foreground">{item.title}</span>
                {episode && (
                  <span className="text-muted"> · {episode}</span>
                )}
              </p>
              <p className="text-muted text-xs">
                {formatRelativeTime(item.watchedAt)}
                {item.completed ? " · finished" : ""}
              </p>
            </div>
          </Link>
        );
      })}

      {hasNextPage && (
        <button
          type="button"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="text-muted mt-4 w-full py-2 text-sm hover:text-foreground disabled:opacity-50"
        >
          {isFetchingNextPage ? "Loading…" : "Load more"}
        </button>
      )}
    </div>
  );
}
