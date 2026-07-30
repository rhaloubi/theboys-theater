"use client";

import { useQueries } from "@tanstack/react-query";
import { SearchBar } from "@/components/browse/search-bar";
import { ContentRow } from "@/components/browse/content-row";
import { popularApi } from "@/lib/api/client";

export function BrowseHome() {
  const [
    continueWatching,
    recent,
    mostWatched,
    thisWeek,
    friendActivity,
  ] = useQueries({
    queries: [
      {
        queryKey: ["popular", "continue-watching"],
        queryFn: () => popularApi.continueWatching(),
        staleTime: 0,
      },
      {
        queryKey: ["popular", "recent"],
        queryFn: () => popularApi.recent(),
        staleTime: 15_000,
      },
      {
        queryKey: ["popular", "most-watched"],
        queryFn: () => popularApi.mostWatched(),
        staleTime: 30_000,
      },
      {
        queryKey: ["popular", "this-week"],
        queryFn: () => popularApi.thisWeek(),
        staleTime: 30_000,
      },
      {
        queryKey: ["popular", "friend-activity"],
        queryFn: () => popularApi.friendActivity(),
        staleTime: 30_000,
      },
    ],
  });

  const fallbackNote = (isFallback?: boolean) =>
    isFallback ? "Trending on TMDB until you start watching together." : undefined;

  return (
    <div className="mx-auto w-full max-w-[1920px] space-y-8 px-4 py-6 md:px-12 md:py-8">
      <SearchBar />

      <ContentRow
        title="Continue Watching"
        items={continueWatching.data?.items ?? []}
        isLoading={continueWatching.isLoading}
        preferWatchLink
        emptyMessage="Nothing in progress — pick something to watch."
      />

      <ContentRow
        title="Recently Watched"
        subtitle={fallbackNote(recent.data?.isFallback)}
        items={recent.data?.items ?? []}
        isLoading={recent.isLoading}
      />

      <ContentRow
        title="Most Watched Between Us"
        subtitle={fallbackNote(mostWatched.data?.isFallback)}
        items={mostWatched.data?.items ?? []}
        isLoading={mostWatched.isLoading}
        showWatchCount
      />

      <ContentRow
        title="Hot This Week"
        subtitle={fallbackNote(thisWeek.data?.isFallback)}
        items={thisWeek.data?.items ?? []}
        isLoading={thisWeek.isLoading}
        showWatchCount
      />

      <ContentRow
        title="Your Friend's Activity"
        items={friendActivity.data?.items ?? []}
        isLoading={friendActivity.isLoading}
        emptyMessage="Your friend hasn't watched anything yet."
      />
    </div>
  );
}
