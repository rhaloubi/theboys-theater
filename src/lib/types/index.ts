export type MediaType = "movie" | "tv";

export type WatchlistSource = "manual" | "imdb_import";

export interface PopularRowItem {
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  watchCount: number;
  lastWatchedAt: string;
  lastWatchedBy: string;
  progressSeconds?: number;
  seasonNumber?: number | null;
  episodeNumber?: number | null;
}

export interface SessionUser {
  id: string;
  slug: string;
  displayName: string;
  avatarColor: string;
}

export interface AuthMeResponse {
  authenticated: boolean;
  user: SessionUser | null;
  needsUserSelection: boolean;
}

export interface ApiErrorBody {
  error: string;
  code?: string;
}
