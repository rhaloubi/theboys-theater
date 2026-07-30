"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { useLogWatch } from "@/hooks/use-log-watch";
import { tmdbApi } from "@/lib/api/client";

export default function WatchMoviePage() {
  const params = useParams<{ id: string }>();
  const tmdbId = Number(params.id);

  const { data } = useQuery({
    queryKey: ["tmdb", "movie", tmdbId],
    queryFn: () => tmdbApi.movie(tmdbId),
    enabled: Number.isFinite(tmdbId),
  });

  const movie = data?.movie;

  useLogWatch(
    movie
      ? {
          tmdbId: movie.id,
          mediaType: "movie",
          title: movie.title,
          posterPath: movie.poster_path,
          backdropPath: movie.backdrop_path,
        }
      : null,
    `movie-${tmdbId}`,
  );

  return (
    <>
      <Header />
      <main className="flex-1 bg-black">
        <div className="mx-auto max-w-[1920px] px-4 py-4 md:px-12">
          <Link
            href={`/title/movie/${tmdbId}`}
            className="text-muted mb-4 inline-block text-sm hover:text-foreground"
          >
            ← Back to {movie?.title ?? "movie"}
          </Link>
          {Number.isFinite(tmdbId) && (
            <iframe
              src={`https://player.videasy.to/movie/${tmdbId}`}
              title={movie?.title ?? "Movie player"}
              allowFullScreen
              className="aspect-video w-full rounded-sm border-0 bg-black"
            />
          )}
        </div>
      </main>
    </>
  );
}
