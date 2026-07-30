"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { tmdbApi } from "@/lib/api/client";
import { backdropUrl, posterUrl, watchHref } from "@/lib/utils/images";

export default function MovieTitlePage() {
  const params = useParams<{ id: string }>();
  const tmdbId = Number(params.id);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["tmdb", "movie", tmdbId],
    queryFn: () => tmdbApi.movie(tmdbId),
    enabled: Number.isFinite(tmdbId),
  });

  const movie = data?.movie;

  return (
    <>
      <Header />
      <main className="flex-1">
        {isLoading && (
          <div className="flex min-h-[50vh] items-center justify-center">
            <p className="text-muted">Loading…</p>
          </div>
        )}
        {isError && (
          <div className="flex min-h-[50vh] items-center justify-center">
            <p className="text-primary">Movie not found.</p>
          </div>
        )}
        {movie && (
          <div className="relative">
            {movie.backdrop_path && (
              <div className="absolute inset-x-0 top-0 h-[50vh] overflow-hidden">
                <Image
                  src={backdropUrl(movie.backdrop_path)!}
                  alt=""
                  fill
                  priority
                  className="object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
              </div>
            )}
            <div className="relative mx-auto flex max-w-[1920px] flex-col gap-6 px-4 py-8 md:flex-row md:px-12 md:py-12">
              <div className="relative mx-auto aspect-[2/3] w-[200px] shrink-0 overflow-hidden rounded-sm md:mx-0 md:w-[260px]">
                <Image
                  src={posterUrl(movie.poster_path, "w500")}
                  alt={movie.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="max-w-2xl space-y-4">
                <h1 className="text-3xl font-bold md:text-4xl">{movie.title}</h1>
                <p className="text-muted text-sm">
                  {movie.release_date?.slice(0, 4)}
                  {movie.runtime ? ` · ${movie.runtime} min` : ""}
                  {movie.genres?.length
                    ? ` · ${movie.genres.map((g) => g.name).join(", ")}`
                    : ""}
                </p>
                <p className="text-sm leading-relaxed md:text-base">
                  {movie.overview || "No overview available."}
                </p>
                <Link
                  href={watchHref(movie.id, "movie")}
                  className="inline-flex h-12 items-center justify-center rounded bg-primary px-8 font-semibold text-white transition-opacity hover:opacity-90"
                >
                  ▶ Play
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
