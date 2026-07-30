"use client";

import { useQueries } from "@tanstack/react-query";
import { SearchBar } from "@/components/browse/search-bar";
import { ContentRow } from "@/components/browse/content-row";
import { useAuthUser } from "@/hooks/use-auth-user";
import { popularApi } from "@/lib/api/client";

export function BrowseHome() {
  const { data: session } = useAuthUser();
  const hasUser = Boolean(session?.user);

  const queries = useQueries({
    queries: [
      {
        queryKey: ["popular", "continue-watching"],
        queryFn: () => popularApi.continueWatching(),
        staleTime: 0,
        enabled: hasUser,
      },
      {
        queryKey: ["popular", "recent"],
        queryFn: () => popularApi.recent(),
        staleTime: 15_000,
        enabled: session?.authenticated,
      },
      {
        queryKey: ["popular", "most-watched"],
        queryFn: () => popularApi.mostWatched(),
        staleTime: 30_000,
        enabled: session?.authenticated,
      },
      {
        queryKey: ["popular", "this-week"],
        queryFn: () => popularApi.thisWeek(),
        staleTime: 30_000,
        enabled: session?.authenticated,
      },
      {
        queryKey: ["popular", "friend-activity"],
        queryFn: () => popularApi.friendActivity(),
        staleTime: 30_000,
        enabled: hasUser,
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

  const fallbackNote = (isFallback?: boolean) =>
    isFallback ? "Trending on TMDB until you start watching together." : undefined;

  return (
    <div className="mx-auto w-full max-w-[1920px] space-y-10 px-4 py-6 md:px-12 md:py-8">
      <section className="flex flex-col items-center pt-4 pb-2 md:pt-8">
        <SearchBar />
      </section>

      <ContentRow
        title="Continue Watching"
        items={continueWatching.data?.items ?? []}
        isLoading={hasUser && continueWatching.isLoading}
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
        isLoading={hasUser && friendActivity.isLoading}
        emptyMessage="Your friend hasn't watched anything yet."
      />
    </div>
  );
}
