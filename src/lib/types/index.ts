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

export interface HistoryItem {
  id: string;
  userSlug: string;
  displayName: string;
  avatarColor: string;
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  seasonNumber: number | null;
  episodeNumber: number | null;
  episodeTitle: string | null;
  watchedAt: string;
  completed: boolean;
}

export interface HistoryResponse {
  items: HistoryItem[];
  nextCursor: string | null;
}

export interface ImdbRatingItem {
  imdbId: string;
  tmdbId: number | null;
  mediaType: MediaType | null;
  title: string;
  year: number | null;
  rating: number;
  ratedAt: string | null;
}

export interface CompareUserStats {
  slug: string;
  displayName: string;
  avatarColor: string;
  avgRating: number;
  totalRated: number;
}

export interface SharedRatingTitle {
  tmdbId: number | null;
  imdbId: string;
  title: string;
  mediaType: MediaType | null;
  posterPath: string | null;
  ratings: Record<string, number>;
  diff: number;
}

export interface ImdbCompareResponse {
  users: CompareUserStats[];
  sharedTitles: SharedRatingTitle[];
  biggestAgreements: SharedRatingTitle[];
  biggestDisagreements: SharedRatingTitle[];
  onlyRatedByUser: Record<string, ImdbRatingItem[]>;
}

export interface WatchlistItem {
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  addedAt: string;
  source: WatchlistSource;
}

export interface WatchlistCompareResponse {
  shared: WatchlistItem[];
  onlyByUser: Record<string, WatchlistItem[]>;
}

export interface ImdbImportResult {
  imported: number;
  unmapped: number;
  unmappedTitles: string[];
}
