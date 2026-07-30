"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { useLogWatch } from "@/hooks/use-log-watch";
import { tmdbApi } from "@/lib/api/client";

export default function WatchTvPage() {
  const params = useParams<{ id: string; season: string; episode: string }>();
  const tmdbId = Number(params.id);
  const season = Number(params.season);
  const episode = Number(params.episode);

  const { data } = useQuery({
    queryKey: ["tmdb", "tv", tmdbId],
    queryFn: () => tmdbApi.tv(tmdbId),
    enabled: Number.isFinite(tmdbId),
  });

  const show = data?.show;

  useLogWatch(
    show
      ? {
          tmdbId: show.id,
          mediaType: "tv",
          title: show.name,
          posterPath: show.poster_path,
          backdropPath: show.backdrop_path,
          seasonNumber: season,
          episodeNumber: episode,
        }
      : null,
    `tv-${tmdbId}-${season}-${episode}`,
  );

  return (
    <>
      <Header />
      <main className="flex-1 bg-black">
        <div className="mx-auto max-w-[1920px] px-4 py-4 md:px-12">
          <Link
            href={`/title/tv/${tmdbId}`}
            className="text-muted mb-4 inline-block text-sm hover:text-foreground"
          >
            ← Back to {show?.name ?? "show"}
          </Link>
          <p className="text-muted mb-2 text-sm">
            Season {season} · Episode {episode}
          </p>
          {Number.isFinite(tmdbId) && (
            <iframe
              src={`https://player.videasy.to/tv/${tmdbId}/${season}/${episode}`}
              title={`${show?.name ?? "TV"} S${season}E${episode}`}
              allowFullScreen
              className="aspect-video w-full rounded-sm border-0 bg-black"
            />
          )}
        </div>
      </main>
    </>
  );
}
