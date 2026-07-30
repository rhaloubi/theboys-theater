"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { tmdbApi } from "@/lib/api/client";
import { watchHref } from "@/lib/utils/images";

interface TvSeasonEpisodePickerProps {
  tmdbId: number;
  season: number;
  episode: number;
  compact?: boolean;
}

export function TvSeasonEpisodePicker({
  tmdbId,
  season,
  episode,
  compact = false,
}: TvSeasonEpisodePickerProps) {
  const router = useRouter();

  const { data: showData } = useQuery({
    queryKey: ["tmdb", "tv", tmdbId],
    queryFn: () => tmdbApi.tv(tmdbId),
    enabled: Number.isFinite(tmdbId),
  });

  const seasons =
    showData?.show.seasons.filter(
      (s) => s.season_number > 0 && s.episode_count > 0,
    ) ?? [];

  const { data: seasonData, isLoading: episodesLoading } = useQuery({
    queryKey: ["tmdb", "tv", tmdbId, "season", season],
    queryFn: () => tmdbApi.tvSeason(tmdbId, season),
    enabled: Number.isFinite(tmdbId) && season > 0,
  });

  const episodes = seasonData?.season.episodes ?? [];

  function goToEpisode(nextSeason: number, nextEpisode: number) {
    router.push(watchHref(tmdbId, "tv", nextSeason, nextEpisode));
  }

  const selectClass = compact
    ? "h-9 rounded border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
    : "h-11 min-w-[140px] rounded border border-border bg-surface px-3 text-sm outline-none focus:border-primary";

  return (
    <div className={`flex flex-wrap items-center gap-3 ${compact ? "" : "mb-4"}`}>
      <label className="flex items-center gap-2">
        <span className="text-muted text-sm">Season</span>
        <select
          value={season}
          onChange={(e) => {
            const nextSeason = Number(e.target.value);
            goToEpisode(nextSeason, 1);
          }}
          className={selectClass}
        >
          {seasons.map((s) => (
            <option key={s.id} value={s.season_number}>
              {s.name || `Season ${s.season_number}`}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2">
        <span className="text-muted text-sm">Episode</span>
        <select
          value={episode}
          disabled={episodesLoading || episodes.length === 0}
          onChange={(e) => goToEpisode(season, Number(e.target.value))}
          className={selectClass}
        >
          {episodes.map((ep) => (
            <option key={ep.id} value={ep.episode_number}>
              {ep.episode_number}. {ep.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
