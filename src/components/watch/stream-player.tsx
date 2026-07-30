"use client";

import { Suspense } from "react";
import { useStreamProvider } from "@/hooks/use-stream-provider";
import { buildStreamUrl, type StreamTarget } from "@/lib/streaming/providers";
import { StreamProviderPicker } from "@/components/watch/stream-provider-picker";

interface StreamPlayerProps {
  target: StreamTarget;
  title: string;
}

function StreamPlayerInner({ target, title }: StreamPlayerProps) {
  const { providerId, setProviderId } = useStreamProvider();
  const embedUrl = buildStreamUrl(providerId, target);

  return (
    <div className="space-y-3">
      <StreamProviderPicker value={providerId} onChange={setProviderId} />

      <div className="overflow-hidden rounded-sm bg-black">
        <iframe
          key={`${providerId}-${target.tmdbId}-${target.mediaType}-${target.season ?? 0}-${target.episode ?? 0}`}
          src={embedUrl}
          title={title}
          allowFullScreen
          referrerPolicy="origin"
          className="aspect-video w-full border-0"
        />
      </div>

      <p className="text-muted text-xs">
        Ads may appear inside the player — use a browser ad blocker, or{" "}
        <a
          href={embedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground underline hover:text-primary"
        >
          open in a new tab
        </a>
        .
      </p>
    </div>
  );
}

export function StreamPlayer(props: StreamPlayerProps) {
  return (
    <Suspense
      fallback={
        <div className="flex aspect-video items-center justify-center rounded-sm bg-black">
          <p className="text-muted text-sm">Loading player…</p>
        </div>
      }
    >
      <StreamPlayerInner {...props} />
    </Suspense>
  );
}
