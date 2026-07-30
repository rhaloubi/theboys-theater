export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = Date.now();
  const diffSec = Math.floor((now - date.getTime()) / 1000);

  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function formatEpisodeLabel(
  season: number | null,
  episode: number | null,
  episodeTitle?: string | null,
): string | null {
  if (season == null || episode == null) return null;
  const base = `S${season}E${episode}`;
  return episodeTitle ? `${base} · ${episodeTitle}` : base;
}
