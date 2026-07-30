"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AddToWatchlistButton } from "@/components/title/add-to-watchlist-button";
import { TvSeasonEpisodePicker } from "@/components/watch/tv-season-episode-picker";
import { Header } from "@/components/layout/header";
import { tmdbApi } from "@/lib/api/client";
import { backdropUrl, posterUrl, watchHref } from "@/lib/utils/images";

export default function TvTitlePage() {
  const params = useParams<{ id: string }>();
  const tmdbId = Number(params.id);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["tmdb", "tv", tmdbId],
    queryFn: () => tmdbApi.tv(tmdbId),
    enabled: Number.isFinite(tmdbId),
  });

  const show = data?.show;
  const seasons =
    show?.seasons.filter((s) => s.season_number > 0 && s.episode_count > 0) ??
    [];

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
            <p className="text-primary">Show not found.</p>
          </div>
        )}
        {show && (
          <div className="relative">
            {show.backdrop_path && (
              <div className="absolute inset-x-0 top-0 h-[50vh] overflow-hidden">
                <Image
                  src={backdropUrl(show.backdrop_path)!}
                  alt=""
                  fill
                  priority
                  className="object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
              </div>
            )}
            <div className="relative mx-auto max-w-[1920px] space-y-8 px-4 py-8 md:px-12 md:py-12">
              <div className="flex flex-col gap-6 md:flex-row">
                <div className="relative mx-auto aspect-[2/3] w-[200px] shrink-0 overflow-hidden rounded-sm md:mx-0 md:w-[260px]">
                  <Image
                    src={posterUrl(show.poster_path, "w500")}
                    alt={show.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="max-w-2xl space-y-4">
                  <h1 className="text-3xl font-bold md:text-4xl">{show.name}</h1>
                  <p className="text-muted text-sm">
                    {show.first_air_date?.slice(0, 4)}
                    {show.number_of_seasons
                      ? ` · ${show.number_of_seasons} seasons`
                      : ""}
                    {show.genres?.length
                      ? ` · ${show.genres.map((g) => g.name).join(", ")}`
                      : ""}
                  </p>
                  <p className="text-sm leading-relaxed md:text-base">
                    {show.overview || "No overview available."}
                  </p>
                  <div className="flex flex-wrap items-end gap-4">
                    <TvSeasonEpisodePicker
                      tmdbId={show.id}
                      season={seasons[0]?.season_number ?? 1}
                      episode={1}
                      compact
                    />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={watchHref(
                        show.id,
                        "tv",
                        seasons[0]?.season_number ?? 1,
                        1,
                      )}
                      className="inline-flex h-12 items-center justify-center rounded bg-primary px-8 font-semibold text-white transition-opacity hover:opacity-90"
                    >
                      ▶ Play
                    </Link>
                    <AddToWatchlistButton
                      tmdbId={show.id}
                      mediaType="tv"
                      title={show.name}
                      posterPath={show.poster_path}
                    />
                  </div>
                </div>
              </div>

              {seasons.length > 0 && (
                <section className="space-y-3">
                  <h2 className="text-xl font-semibold">Seasons</h2>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {seasons.map((season) => (
                      <Link
                        key={season.id}
                        href={watchHref(show.id, "tv", season.season_number, 1)}
                        className="rounded border border-border bg-surface p-4 transition-colors hover:bg-surface-elevated"
                      >
                        <p className="font-medium">{season.name}</p>
                        <p className="text-muted text-sm">
                          {season.episode_count} episodes
                        </p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
