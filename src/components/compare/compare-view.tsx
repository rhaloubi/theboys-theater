"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { compareApi } from "@/lib/api/client";
import { titleHref } from "@/lib/utils/images";
import type { ImdbCompareResponse, WatchlistCompareResponse } from "@/lib/types";

type Tab = "ratings" | "watchlist";

export function CompareView() {
  const [tab, setTab] = useState<Tab>("ratings");

  const imdbQuery = useQuery({
    queryKey: ["imdb", "compare"],
    queryFn: () => compareApi.imdb(),
    staleTime: 300_000,
  });

  const watchlistQuery = useQuery({
    queryKey: ["watchlist", "compare"],
    queryFn: () => compareApi.watchlist(),
    staleTime: 60_000,
  });

  const users = imdbQuery.data?.users ?? [];

  return (
    <div className="space-y-8">
      <div className="flex gap-2">
        {(["ratings", "watchlist"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded px-4 py-2 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? "bg-primary text-white"
                : "bg-surface text-muted hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "ratings" && (
        <RatingsTab data={imdbQuery.data} isLoading={imdbQuery.isLoading} />
      )}

      {tab === "watchlist" && (
        <WatchlistTab
          data={watchlistQuery.data}
          isLoading={watchlistQuery.isLoading}
          users={users}
        />
      )}
    </div>
  );
}

function RatingsTab({
  data,
  isLoading,
}: {
  data: ImdbCompareResponse | undefined;
  isLoading: boolean;
}) {
  if (isLoading) return <p className="text-muted text-sm">Loading ratings…</p>;

  const users = data?.users ?? [];

  if (!data || users.length === 0) {
    return (
      <p className="text-muted text-sm">
        Import your IMDb ratings from{" "}
        <Link href="/profile" className="text-primary hover:underline">
          Profile
        </Link>{" "}
        to start comparing.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        {users.map((user) => (
          <div
            key={user.slug}
            className="rounded-lg border border-border bg-surface p-6 text-center"
          >
            <span
              className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white"
              style={{ backgroundColor: user.avatarColor }}
            >
              {user.displayName.charAt(0)}
            </span>
            <p className="font-semibold">{user.displayName}</p>
            <p className="text-3xl font-bold tabular-nums">
              {user.totalRated > 0 ? user.avgRating : "—"}
              {user.totalRated > 0 && (
                <span className="text-muted text-lg"> /10</span>
              )}
            </p>
            <p className="text-muted text-sm">{user.totalRated} rated</p>
          </div>
        ))}
      </div>

      {data.biggestDisagreements.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Biggest Disagreements</h2>
          <div className="space-y-2">
            {data.biggestDisagreements.slice(0, 10).map((item) => (
              <SharedRatingRow key={item.imdbId} item={item} users={users} />
            ))}
          </div>
        </section>
      )}

      {data.biggestAgreements.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Great Minds Think Alike</h2>
          <div className="space-y-2">
            {data.biggestAgreements.slice(0, 10).map((item) => (
              <SharedRatingRow key={item.imdbId} item={item} users={users} />
            ))}
          </div>
        </section>
      )}

      {data.sharedTitles.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">
            All Shared Ratings ({data.sharedTitles.length})
          </h2>
          <div className="space-y-2">
            {data.sharedTitles.slice(0, 20).map((item) => (
              <SharedRatingRow key={item.imdbId} item={item} users={users} />
            ))}
          </div>
        </section>
      )}

      {users.some((u) => (data.onlyRatedByUser[u.slug]?.length ?? 0) > 0) && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Only One of You Rated</h2>
          {users.map((user) => {
            const only = data.onlyRatedByUser[user.slug] ?? [];
            if (only.length === 0) return null;
            return (
              <div key={user.slug} className="space-y-2">
                <p className="text-muted text-sm font-medium">
                  {user.displayName} ({only.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {only.slice(0, 15).map((item) => (
                    <span
                      key={item.imdbId}
                      className="rounded border border-border bg-surface px-2 py-1 text-xs"
                    >
                      {item.title}{" "}
                      <span className="text-primary font-semibold">
                        {item.rating}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}

function SharedRatingRow({
  item,
  users,
}: {
  item: ImdbCompareResponse["sharedTitles"][number];
  users: ImdbCompareResponse["users"];
}) {
  const href =
    item.tmdbId && item.mediaType
      ? titleHref(item.tmdbId, item.mediaType)
      : null;

  const content = (
    <div className="flex items-center justify-between gap-4 rounded border border-border bg-surface/50 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate font-medium">{item.title}</p>
        {item.diff >= 4 && (
          <p className="text-warning text-xs">Δ {item.diff} points apart</p>
        )}
      </div>
      <div className="flex shrink-0 gap-2">
        {users.map((user) => (
          <span
            key={user.slug}
            className="rounded px-2 py-1 text-xs font-semibold text-white"
            style={{ backgroundColor: user.avatarColor }}
            title={user.displayName}
          >
            {item.ratings[user.slug] ?? "—"}
          </span>
        ))}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block transition-opacity hover:opacity-80">
        {content}
      </Link>
    );
  }

  return content;
}

function WatchlistTab({
  data,
  isLoading,
  users,
}: {
  data: WatchlistCompareResponse | undefined;
  isLoading: boolean;
  users: ImdbCompareResponse["users"];
}) {
  if (isLoading) {
    return <p className="text-muted text-sm">Loading watchlists…</p>;
  }

  if (!data) {
    return <p className="text-muted text-sm">Could not load watchlists.</p>;
  }

  return (
    <div className="space-y-8">
      {data.shared.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-success text-xl font-semibold">
            Both Want to Watch ({data.shared.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.shared.map((item) => (
              <Link
                key={`${item.mediaType}-${item.tmdbId}`}
                href={titleHref(item.tmdbId, item.mediaType)}
                className="rounded border border-success/40 bg-success/10 px-3 py-1.5 text-sm transition-opacity hover:opacity-80"
              >
                {item.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      {users.map((user) => {
        const only = data.onlyByUser[user.slug] ?? [];
        if (only.length === 0) return null;
        return (
          <section key={user.slug} className="space-y-3">
            <h2 className="text-lg font-semibold">
              Only {user.displayName}&apos;s List ({only.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {only.map((item) => (
                <Link
                  key={`${item.mediaType}-${item.tmdbId}`}
                  href={titleHref(item.tmdbId, item.mediaType)}
                  className="rounded border border-border bg-surface px-3 py-1.5 text-sm transition-colors hover:bg-surface-elevated"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      {data.shared.length === 0 &&
        users.every((u) => (data.onlyByUser[u.slug]?.length ?? 0) === 0) && (
          <p className="text-muted text-sm">
            No watchlist items yet. Add titles from movie/show pages.
          </p>
        )}
    </div>
  );
}
