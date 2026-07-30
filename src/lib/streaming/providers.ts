export type StreamProviderId =
  | "videasy"
  | "vidlink"
  | "vidsrc"
  | "smashystream"
  | "autoembed";

export interface StreamTarget {
  tmdbId: number;
  mediaType: "movie" | "tv";
  season?: number;
  episode?: number;
}

export interface StreamProvider {
  id: StreamProviderId;
  label: string;
  buildUrl: (target: StreamTarget) => string;
}

export const STREAM_PROVIDERS: StreamProvider[] = [
  {
    id: "videasy",
    label: "Videasy",
    buildUrl: ({ tmdbId, mediaType, season = 1, episode = 1 }) =>
      mediaType === "movie"
        ? `https://player.videasy.to/movie/${tmdbId}`
        : `https://player.videasy.to/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidlink",
    label: "VidLink",
    buildUrl: ({ tmdbId, mediaType, season = 1, episode = 1 }) =>
      mediaType === "movie"
        ? `https://vidlink.pro/movie/${tmdbId}`
        : `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidsrc",
    label: "VidSrc",
    buildUrl: ({ tmdbId, mediaType, season = 1, episode = 1 }) =>
      mediaType === "movie"
        ? `https://vidsrc.to/embed/movie/${tmdbId}`
        : `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "smashystream",
    label: "SmashyStream",
    buildUrl: ({ tmdbId, mediaType, season = 1, episode = 1 }) =>
      mediaType === "movie"
        ? `https://player.smashy.stream/movie/${tmdbId}`
        : `https://player.smashy.stream/tv/${tmdbId}?s=${season}&e=${episode}`,
  },
  {
    id: "autoembed",
    label: "AutoEmbed",
    buildUrl: ({ tmdbId, mediaType, season = 1, episode = 1 }) =>
      mediaType === "movie"
        ? `https://autoembed.co/movie/tmdb/${tmdbId}`
        : `https://autoembed.co/tv/tmdb/${tmdbId}-${season}-${episode}`,
  },
];

export const DEFAULT_STREAM_PROVIDER: StreamProviderId = "videasy";

export const STREAM_PROVIDER_STORAGE_KEY = "tbt_stream_provider";

export function isStreamProviderId(value: string): value is StreamProviderId {
  return STREAM_PROVIDERS.some((provider) => provider.id === value);
}

export function getStreamProvider(id: StreamProviderId): StreamProvider {
  return (
    STREAM_PROVIDERS.find((provider) => provider.id === id) ?? STREAM_PROVIDERS[0]
  );
}

export function buildStreamUrl(
  providerId: StreamProviderId,
  target: StreamTarget,
): string {
  return getStreamProvider(providerId).buildUrl(target);
}
