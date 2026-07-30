"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { watchlistApi } from "@/lib/api/client";

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

  const { data } = useQuery({
    queryKey: ["watchlist", "mine"],
    queryFn: () => watchlistApi.list(),
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
