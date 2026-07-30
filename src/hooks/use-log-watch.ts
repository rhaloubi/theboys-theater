"use client";

import { useEffect, useRef } from "react";
import { historyApi } from "@/lib/api/client";

interface WatchLogPayload {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  seasonNumber?: number | null;
  episodeNumber?: number | null;
  episodeTitle?: string | null;
}

/** Log a watch once per title/episode (guards React Strict Mode double effects). */
export function useLogWatch(payload: WatchLogPayload | null, logKey: string) {
  const loggedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!payload) return;
    if (loggedKeyRef.current === logKey) return;
    loggedKeyRef.current = logKey;
    void historyApi.logWatch(payload).catch(() => {
      // Profile may not be selected yet — ignore silently
    });
  }, [payload, logKey]);
}
