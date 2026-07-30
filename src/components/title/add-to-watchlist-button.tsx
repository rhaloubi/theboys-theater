"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { watchlistApi } from "@/lib/api/client";
import { useAuthUser } from "@/hooks/use-auth-user";

interface AddToWatchlistButtonProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string | null;
}

export function AddToWatchlistButton({
  tmdbId,
  mediaType,
  title,
  posterPath,
}: AddToWatchlistButtonProps) {
  const queryClient = useQueryClient();
  const { data: session } = useAuthUser();
  const hasUser = Boolean(session?.user);

  const { data } = useQuery({
    queryKey: ["watchlist", "mine"],
    queryFn: () => watchlistApi.list(),
    enabled: hasUser,
  });

  const isOnList = data?.items.some(
    (i) => i.tmdbId === tmdbId && i.mediaType === mediaType,
  );

  const addMutation = useMutation({
    mutationFn: () =>
      watchlistApi.add({ tmdbId, mediaType, title, posterPath }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => watchlistApi.remove(tmdbId, mediaType),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });

  if (!hasUser) return null;

  const loading = addMutation.isPending || removeMutation.isPending;

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() =>
        isOnList ? removeMutation.mutate() : addMutation.mutate()
      }
      className="inline-flex h-12 items-center justify-center rounded border border-border px-6 font-medium transition-colors hover:bg-surface disabled:opacity-50"
    >
      {loading ? "…" : isOnList ? "✓ On Watchlist" : "+ Watchlist"}
    </button>
  );
}
