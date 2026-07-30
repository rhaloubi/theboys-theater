import type { ApiErrorBody, AuthMeResponse, PopularRowItem } from "@/lib/types";
import type { TmdbSearchResult } from "@/lib/tmdb/types";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/v1${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = (await res.json()) as ApiErrorBody;
      message = body.error ?? message;
    } catch {
      // ignore
    }
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}

export const authApi = {
  verifyCode: (code: string) =>
    api<{ success: boolean; needsUserSelection: boolean }>("/auth/verify-code", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),
  selectUser: (userSlug: string) =>
    api<{ user: AuthMeResponse["user"] }>("/auth/select-user", {
      method: "POST",
      body: JSON.stringify({ userSlug }),
    }),
  me: () => api<AuthMeResponse>("/auth/me"),
  logout: () => api<{ success: boolean }>("/auth/logout", { method: "POST" }),
  listUsers: () =>
    api<{
      users: Array<{
        slug: string;
        displayName: string;
        avatarColor: string;
      }>;
    }>("/auth/select-user"),
};

export const healthApi = {
  check: () =>
    api<{ ok: boolean; db: string; timestamp: string }>("/health"),
};

interface PopularResponse {
  items: PopularRowItem[];
  isFallback: boolean;
}

export const popularApi = {
  mostWatched: () => api<PopularResponse>("/popular/most-watched"),
  thisWeek: () => api<PopularResponse>("/popular/this-week"),
  recent: () => api<PopularResponse>("/popular/recent"),
  friendActivity: () => api<PopularResponse>("/popular/friend-activity"),
  continueWatching: () => api<PopularResponse>("/popular/continue-watching"),
};

export const tmdbApi = {
  search: (q: string, signal?: AbortSignal) =>
    api<{
      results: TmdbSearchResult[];
      page: number;
      totalPages: number;
      totalResults: number;
    }>(`/tmdb/search?q=${encodeURIComponent(q)}`, { signal }),
  movie: (id: number) =>
    api<{ movie: import("@/lib/tmdb/types").TmdbMovieDetail }>(
      `/tmdb/movie/${id}`,
    ),
  tv: (id: number) =>
    api<{ show: import("@/lib/tmdb/types").TmdbTvDetail }>(`/tmdb/tv/${id}`),
};

export const historyApi = {
  logWatch: (body: {
    tmdbId: number;
    mediaType: "movie" | "tv";
    title: string;
    posterPath?: string | null;
    backdropPath?: string | null;
    seasonNumber?: number | null;
    episodeNumber?: number | null;
    episodeTitle?: string | null;
    progressSeconds?: number;
  }) =>
    api<{ id: string; watchedAt: string }>("/history", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
