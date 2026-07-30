# The Boys Theater — Backend Architecture

> Private streaming hub for two friends. MongoDB Atlas (free tier), Node/Next.js API routes, TMDB for metadata, Videasy for playback.

---

## Overview

| Concern | Choice |
|---------|--------|
| Database | MongoDB Atlas M0 (512 MB free) |
| Runtime | Next.js App Router API routes (or separate Express if preferred) |
| Metadata | TMDB API (server-side only) |
| Playback | Videasy iframe embed (no stream proxying on our side) |
| Auth | Shared secret code → session cookie + display name (no passwords) |
| Users | Fixed small set (you + friend); community data is shared by design |

---

## Core Concepts

### 1. User-popular rows (not TMDB popular)

**"Popular" on the home page means popular among *your* users**, not global TMDB trending.

Aggregations derived from `watch_events`:

| Row title | Query logic |
|-----------|-------------|
| **Most watched (all time)** | Group by `tmdbId` + `mediaType`, count events, sort desc |
| **Hot this week** | Same, filter `watchedAt >= now - 7d` |
| **Recently watched** | Latest distinct title per user, merged timeline |
| **Your friend is watching** | Most recent event from the *other* user in last 24h |
| **Rewatch champions** | Titles with `watchCount >= 2` for either user |

TMDB `/movie/popular` and `/tv/popular` are used only as **fallback** when watch history is empty (cold start) or to fill poster gaps — never as the primary "Popular" row label.

### 2. Community watch history

All watch events are visible to both users. No private history.

### 3. IMDb rankings & watchlist comparison

IMDb does not offer a free public API for personal lists. Strategy:

1. **Import via IMDb CSV export** (Settings → Your ratings → Export) — includes `Const`, `Title`, `Year`, `You rated`, `Date Rated`.
2. **Watchlist import** — IMDb list export or manual CSV with TMDB ID mapping.
3. **TMDB `/find/{imdb_id}`** maps IMDb IDs → TMDB IDs for posters and Videasy playback links.

Comparison endpoints return side-by-side data: ratings diff, shared watchlist, "friend rated higher/lower", titles only one of you has seen.

---

## MongoDB Collections

### `users`

Lightweight profiles after secret-code gate. No email/password.

```ts
{
  _id: ObjectId,
  slug: "tyler" | "mike",           // stable identifier
  displayName: "Tyler",
  avatarColor: "#e50914",           // optional accent for UI
  imdbImportUpdatedAt: Date | null,
  createdAt: Date,
  updatedAt: Date
}
```

**Seed:** Pre-create two user slugs in a migration/seed script. After code entry, user picks which profile they are (or auto-detect via cookie if already set).

---

### `sessions`

Simple session store (or use signed JWT in httpOnly cookie without DB — either works for 2 users).

```ts
{
  _id: ObjectId,
  tokenHash: string,                // sha256 of session token
  userId: ObjectId,
  expiresAt: Date,
  createdAt: Date
}
```

TTL index on `expiresAt` for auto-cleanup.

---

### `watch_events`

Append-only log. Source of truth for community feed and user-popular rows.

```ts
{
  _id: ObjectId,
  userId: ObjectId,
  userSlug: string,                 // denormalized for fast reads
  displayName: string,              // denormalized

  tmdbId: number,
  mediaType: "movie" | "tv",
  title: string,
  posterPath: string | null,
  backdropPath: string | null,

  // TV only
  seasonNumber: number | null,
  episodeNumber: number | null,
  episodeTitle: string | null,

  // Playback telemetry
  progressSeconds: number,          // last known position
  durationSeconds: number | null,
  completed: boolean,               // true if watched >= 90%

  watchedAt: Date,                  // last heartbeat / play start
  createdAt: Date
}
```

**Indexes:**

```js
db.watch_events.createIndex({ watchedAt: -1 })
db.watch_events.createIndex({ userId: 1, watchedAt: -1 })
db.watch_events.createIndex({ tmdbId: 1, mediaType: 1, watchedAt: -1 })
db.watch_events.createIndex({ userSlug: 1, tmdbId: 1, mediaType: 1 })
```

**Heartbeat rule:** Client sends `PATCH` every 30s while player is active. Upsert logic: one "active session" row per user + title (+ S/E for TV), update `progressSeconds` and `watchedAt`.

---

### `imdb_ratings`

Imported from IMDb CSV, mapped to TMDB.

```ts
{
  _id: ObjectId,
  userId: ObjectId,
  userSlug: string,

  imdbId: string,                   // "tt0133093"
  tmdbId: number | null,            // null if mapping failed
  mediaType: "movie" | "tv" | null,

  title: string,
  year: number | null,
  rating: number,                   // 1–10, user's IMDb score
  ratedAt: Date | null,             // from IMDb export

  importedAt: Date,
  updatedAt: Date
}
```

**Indexes:**

```js
db.imdb_ratings.createIndex({ userId: 1, imdbId: 1 }, { unique: true })
db.imdb_ratings.createIndex({ userId: 1, rating: -1 })
db.imdb_ratings.createIndex({ tmdbId: 1 })
```

---

### `watchlists`

Manual add or IMDb list import.

```ts
{
  _id: ObjectId,
  userId: ObjectId,
  userSlug: string,

  tmdbId: number,
  mediaType: "movie" | "tv",
  title: string,
  posterPath: string | null,

  source: "manual" | "imdb_import",
  addedAt: Date,
  notes: string | null              // optional personal note
}
```

**Indexes:**

```js
db.watchlists.createIndex({ userId: 1, tmdbId: 1, mediaType: 1 }, { unique: true })
db.watchlists.createIndex({ userId: 1, addedAt: -1 })
```

---

### `title_stats` (optional materialized cache)

Pre-aggregated stats for fast home page. Rebuilt on watch event write or via cron every 5 min.

```ts
{
  _id: ObjectId,
  tmdbId: number,
  mediaType: "movie" | "tv",
  title: string,
  posterPath: string | null,

  totalWatchCount: number,
  watchCountByUser: { [userSlug: string]: number },
  lastWatchedAt: Date,
  lastWatchedBy: string,
  uniqueViewers: number             // 1 or 2 for this app
}
```

**Indexes:**

```js
db.title_stats.createIndex({ totalWatchCount: -1 })
db.title_stats.createIndex({ lastWatchedAt: -1 })
```

For 2 users, aggregation on read is fine without this collection initially. Add when home page feels slow.

---

## API Routes

Base path: `/api/v1`

### Auth & gate

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/auth/verify-code` | Body: `{ code: string }`. Returns session cookie if valid. |
| `POST` | `/auth/select-user` | Body: `{ userSlug: string }`. Attach profile to session. |
| `GET` | `/auth/me` | Current user from session. |
| `POST` | `/auth/logout` | Clear session. |

**Secret code:** Store hashed in env (`GATE_CODE_HASH`). Never commit plaintext.

---

### Watch history & community

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/history` | Query: `limit`, `cursor`, `userSlug?`. Community timeline. |
| `POST` | `/history` | Log play start. Body: tmdbId, mediaType, title, poster, S/E. |
| `PATCH` | `/history/:id` | Heartbeat: progressSeconds, completed. |
| `GET` | `/history/resume` | Query: tmdbId, mediaType, season?, episode? → last progress for current user. |

---

### User-popular (home rows)

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/popular/most-watched` | Top N by watch count (all users). |
| `GET` | `/popular/this-week` | Top N last 7 days. |
| `GET` | `/popular/recent` | Latest watches, all users. |
| `GET` | `/popular/friend-activity` | Other user's latest activity. |
| `GET` | `/popular/continue-watching` | Current user's in-progress titles. |

All return normalized shape:

```ts
{
  tmdbId: number,
  mediaType: "movie" | "tv",
  title: string,
  posterPath: string | null,
  watchCount: number,
  lastWatchedAt: string,
  lastWatchedBy: string,
  progressSeconds?: number
}
```

---

### IMDb & watchlist comparison

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/imdb/import` | Multipart CSV upload. Parse, map IMDb→TMDB, upsert ratings. |
| `GET` | `/imdb/ratings` | Query: `userSlug?`. Sorted by rating desc. |
| `GET` | `/imdb/compare` | Side-by-side stats for both users (see below). |
| `GET` | `/watchlist` | Query: `userSlug?`. |
| `POST` | `/watchlist` | Add title. |
| `DELETE` | `/watchlist/:tmdbId` | Remove. Query: `mediaType`. |
| `GET` | `/watchlist/compare` | Overlap + diff between users. |

#### `GET /imdb/compare` response shape

```ts
{
  users: [
    { slug: "tyler", displayName: "Tyler", avgRating: 7.2, totalRated: 142 },
    { slug: "mike", displayName: "Mike", avgRating: 6.8, totalRated: 98 }
  ],
  sharedTitles: [
    {
      tmdbId: 157336,
      title: "Interstellar",
      mediaType: "movie",
      ratings: { tyler: 10, mike: 8 },
      diff: 2                        // absolute difference
    }
  ],
  biggestAgreements: [],             // diff <= 1, both rated high (>= 8)
  biggestDisagreements: [],          // diff >= 4
  onlyTylerRated: [],
  onlyMikeRated: []
}
```

---

### TMDB proxy (server-side only)

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/tmdb/search` | Query: `q`, `page`. Proxies `/search/multi`. |
| `GET` | `/tmdb/movie/:id` | Movie details. |
| `GET` | `/tmdb/tv/:id` | TV details. |
| `GET` | `/tmdb/tv/:id/season/:n` | Season episodes. |
| `GET` | `/tmdb/find/imdb/:id` | Map IMDb ID → TMDB. |

**Never expose `TMDB_API_KEY` to the client.**

---

## Aggregation Examples

### Most watched (all users)

```js
db.watch_events.aggregate([
  { $match: { completed: true } },  // or include partial watches — product choice
  { $group: {
      _id: { tmdbId: "$tmdbId", mediaType: "$mediaType" },
      watchCount: { $sum: 1 },
      title: { $first: "$title" },
      posterPath: { $first: "$posterPath" },
      lastWatchedAt: { $max: "$watchedAt" },
      lastWatchedBy: { $last: "$displayName" }
  }},
  { $sort: { watchCount: -1, lastWatchedAt: -1 } },
  { $limit: 20 }
])
```

### Continue watching (current user)

```js
db.watch_events.aggregate([
  { $match: { userId: ObjectId("..."), completed: false, progressSeconds: { $gt: 60 } } },
  { $sort: { watchedAt: -1 } },
  { $group: {
      _id: { tmdbId: "$tmdbId", mediaType: "$mediaType", season: "$seasonNumber", episode: "$episodeNumber" },
      doc: { $first: "$$ROOT" }
  }},
  { $replaceRoot: { newRoot: "$doc" } },
  { $limit: 10 }
])
```

---

## IMDb CSV Import Pipeline

1. User uploads `ratings.csv` from IMDb.
2. Parse columns: `Const` (tt…), `Title`, `Year`, `You rated`, `Date Rated`.
3. For each row, call TMDB `GET /find/{imdb_id}?external_source=imdb_id` (batch with rate limit: 40 req/10s).
4. Upsert into `imdb_ratings`. Store unmapped rows for manual review.
5. Set `users.imdbImportUpdatedAt`.

**Rate limiting:** Queue imports in background job if > 50 rows; return `{ jobId }` and poll status. For 2 users with ~200 ratings each, sync import is acceptable.

---

## Environment Variables

```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# TMDB (server only)
TMDB_API_KEY=
TMDB_BASE_URL=https://api.themoviedb.org/3

# Gate
GATE_CODE_HASH=                    # bcrypt or sha256 of secret code

# Session
SESSION_SECRET=                    # for signing cookies

# App
NEXT_PUBLIC_APP_URL=https://theboys-theater.vercel.app
NEXT_PUBLIC_TMDB_IMAGE_BASE=https://image.tmdb.org/t/p
```

---

## Security Notes (2-user private site)

- Secret code is **obfuscation**, not real security. Fine for friends-only.
- Rate-limit `/auth/verify-code` (5 attempts / 15 min per IP).
- Validate all TMDB IDs server-side before proxy calls.
- Sanitize CSV upload (max 2 MB, `.csv` only).
- CORS: restrict to your domain in production.
- MongoDB: IP allowlist + dedicated DB user with least privilege.

---

## Deployment Checklist

- [ ] MongoDB Atlas M0 cluster + indexes
- [ ] Seed two `users` documents
- [ ] Env vars in Vercel/Railway
- [ ] TTL index on `sessions.expiresAt`
- [ ] TMDB API key (free, instant approval)
- [ ] Test Videasy embed for sample movie + TV episode

---

## Future (out of scope for v1)

- Webhook/cron to refresh IMDb lists automatically (no official API)
- Push notifications when friend starts watching
- In-app rating (instead of IMDb import only)
- Letterboxd CSV as alternate import source
