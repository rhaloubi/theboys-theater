"use client";

import { useQueries } from "@tanstack/react-query";
import { SearchBar } from "@/components/browse/search-bar";
import { ContentRow } from "@/components/browse/content-row";
import { ApiError, popularApi } from "@/lib/api/client";

function getDbErrorMessage(queries: Array<{ error: Error | null }>): string | null {
  for (const q of queries) {
    if (q.error instanceof ApiError && q.error.status === 503) {
      return q.error.message;
    }
  }
  return null;
}

export function BrowseHome() {
  const queries = useQueries({
    queries: [
      {
        queryKey: ["popular", "continue-watching"],
        queryFn: () => popularApi.continueWatching(),
        staleTime: 0,
        retry: (failureCount, error) =>
          !(error instanceof ApiError && error.status === 503) && failureCount < 1,
      },
      {
        queryKey: ["popular", "recent"],
        queryFn: () => popularApi.recent(),
        staleTime: 15_000,
        retry: (failureCount, error) =>
          !(error instanceof ApiError && error.status === 503) && failureCount < 1,
      },
      {
        queryKey: ["popular", "most-watched"],
        queryFn: () => popularApi.mostWatched(),
        staleTime: 30_000,
        retry: (failureCount, error) =>
          !(error instanceof ApiError && error.status === 503) && failureCount < 1,
      },
      {
        queryKey: ["popular", "this-week"],
        queryFn: () => popularApi.thisWeek(),
        staleTime: 30_000,
        retry: (failureCount, error) =>
          !(error instanceof ApiError && error.status === 503) && failureCount < 1,
      },
      {
        queryKey: ["popular", "friend-activity"],
        queryFn: () => popularApi.friendActivity(),
        staleTime: 30_000,
        retry: (failureCount, error) =>
          !(error instanceof ApiError && error.status === 503) && failureCount < 1,
      },
    ],
  });

  const [
    continueWatching,
    recent,
    mostWatched,
    thisWeek,
    friendActivity,
  ] = queries;

  const dbError = getDbErrorMessage(queries);

  const fallbackNote = (isFallback?: boolean) =>
    isFallback ? "Trending on TMDB until you start watching together." : undefined;

  return (
    <div className="mx-auto w-full max-w-[1920px] space-y-8 px-4 py-6 md:px-12 md:py-8">
      {dbError && (
        <div
          className="rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm"
          role="alert"
        >
          {dbError}
        </div>
      )}

      <SearchBar />

      <ContentRow
        title="Continue Watching"
        items={continueWatching.data?.items ?? []}
        isLoading={continueWatching.isLoading && !dbError}
        preferWatchLink
        emptyMessage={
          dbError
            ? undefined
            : "Nothing in progress — pick something to watch."
        }
      />

      <ContentRow
        title="Recently Watched"
        subtitle={fallbackNote(recent.data?.isFallback)}
        items={recent.data?.items ?? []}
        isLoading={recent.isLoading && !dbError}
      />

      <ContentRow
        title="Most Watched Between Us"
        subtitle={fallbackNote(mostWatched.data?.isFallback)}
        items={mostWatched.data?.items ?? []}
        isLoading={mostWatched.isLoading && !dbError}
        showWatchCount
      />

      <ContentRow
        title="Hot This Week"
        subtitle={fallbackNote(thisWeek.data?.isFallback)}
        items={thisWeek.data?.items ?? []}
        isLoading={thisWeek.isLoading && !dbError}
        showWatchCount
      />

      <ContentRow
        title="Your Friend's Activity"
        items={friendActivity.data?.items ?? []}
        isLoading={friendActivity.isLoading && !dbError}
        emptyMessage={
          dbError
            ? undefined
            : "Your friend hasn't watched anything yet."
        }
      />
    </div>
  );
}
