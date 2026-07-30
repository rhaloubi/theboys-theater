# The Boys Theater — Frontend Architecture

> Speed, latency, and data-fetching strategy for a snappy Netflix-style UI with TMDB search, user-popular rows, and community features.

---

## Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 15 (App Router) | SSR for first paint, API routes colocated |
| Styling | Tailwind CSS | Maps cleanly to design tokens |
| Data fetching | TanStack Query v5 | Cache, dedupe, stale-while-revalidate |
| Forms / gate | React state + cookie session | Minimal deps |
| Player | Videasy iframe | Zero custom video logic in v1 |

---

## Page Map

| Route | Purpose | Data sources |
|-------|---------|--------------|
| `/` | Secret code gate + user picker | `POST /auth/*` |
| `/browse` | Home: user-popular rows + search | `/popular/*`, `/tmdb/search` |
| `/title/movie/[id]` | Movie detail + play CTA | `/tmdb/movie/:id`, `/imdb/compare` snippet |
| `/title/tv/[id]` | TV detail + season picker | `/tmdb/tv/:id`, seasons |
| `/watch/movie/[id]` | Videasy player | `/history`, resume |
| `/watch/tv/[id]/[s]/[e]` | TV player | `/history`, resume |
| `/community` | Full watch timeline | `/history` |
| `/compare` | IMDb ratings + watchlist diff | `/imdb/compare`, `/watchlist/compare` |
| `/profile` | Import IMDb CSV, manage watchlist | `/imdb/import`, `/watchlist` |

---

## Rendering Strategy

### Static shell, dynamic rows

- **Layout, nav, design tokens:** static / cached aggressively.
- **User-popular rows:** dynamic, user-specific → `cache: no-store` or short `revalidate: 30`.
- **TMDB detail pages:** ISR `revalidate: 3600` (metadata rarely changes).
- **Search:** always client-fetched (debounced); never SSR per keystroke.

### Route segment config

```ts
// app/browse/page.tsx
export const dynamic = 'force-dynamic'  // user-popular is personalized

// app/title/movie/[id]/page.tsx
export const revalidate = 3600          // TMDB metadata cache 1h
```

---

## Data Fetching Layers

```
┌─────────────────────────────────────────────────────────┐
│  Browser (TanStack Query)                               │
│  ├── staleTime / gcTime per query type                  │
│  ├── prefetch on hover (detail pages)                   │
│  └── optimistic updates (watchlist add/remove)          │
├─────────────────────────────────────────────────────────┤
│  Next.js API routes (/api/v1/*)                         │
│  ├── TMDB proxy + MongoDB aggregations                  │
│  └── Session validation middleware                      │
├─────────────────────────────────────────────────────────┤
│  External: TMDB API, MongoDB Atlas, Videasy iframe      │
└─────────────────────────────────────────────────────────┘
```

**Rule:** Browser never calls TMDB directly. All metadata goes through `/api/v1/tmdb/*`.

---

## TanStack Query Configuration

### Global defaults

```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,        // 1 min default
      gcTime: 300_000,          // 5 min garbage collect
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
```

### Per-query stale times

| Query key | staleTime | Reason |
|-----------|-----------|--------|
| `popular/most-watched` | 30s | Changes when either user watches |
| `popular/this-week` | 30s | Same |
| `popular/recent` | 15s | Live-ish community feel |
| `popular/continue-watching` | 0 | Always fresh on mount |
| `history` | 15s | Community feed |
| `tmdb/search` | 120s | Same query = cache hit |
| `tmdb/movie/:id` | 3600s | Static metadata |
| `tmdb/tv/:id` | 3600s | Static metadata |
| `imdb/compare` | 300s | Changes only on import |
| `watchlist/compare` | 60s | Manual edits |

---

## Home Page (`/browse`) Load Sequence

Priority-ordered parallel fetch to minimize time-to-interactive:

```
Phase 1 (critical path — render above the fold)
├── GET /popular/continue-watching     ← personal, highest priority
└── GET /popular/recent                ← community activity

Phase 2 (secondary rows — slight delay ok)
├── GET /popular/most-watched
├── GET /popular/this-week
└── GET /popular/friend-activity

Phase 3 (defer until idle)
└── Prefetch compare page data if user navigates toward /compare often
```

Implementation: single `useQueries` hook with `enabled` stagger, or render rows as each query resolves (skeleton → content).

```tsx
// Pseudocode
const continueWatching = useQuery({ queryKey: ['popular', 'continue'], ... })
const recent = useQuery({ queryKey: ['popular', 'recent'], ... })
const mostWatched = useQuery({
  queryKey: ['popular', 'most-watched'],
  enabled: continueWatching.isSuccess,  // slight waterfall, avoids burst
})
```

For 2 users on free MongoDB, all four aggregations combined should stay **< 200ms**. If not, add `title_stats` materialized collection (see backend.md).

---

## Search UX & Latency

### Debounce

- **300ms debounce** on input after 2+ characters.
- Cancel in-flight request on new keystroke (`AbortController`).

```ts
const debouncedQuery = useDebouncedValue(query, 300)

useQuery({
  queryKey: ['tmdb', 'search', debouncedQuery],
  queryFn: ({ signal }) => searchTmdb(debouncedQuery, signal),
  enabled: debouncedQuery.length >= 2,
  placeholderData: keepPreviousData,  // no flicker while typing
})
```

### Search results UI

- Show **skeleton rows** (3–5 items) while loading.
- Cap results at **page 1 (20 items)** in overlay; "See all" navigates to `/search?q=`.
- Keyboard: ↑↓ navigate, Enter open detail, Esc close.

### TMDB image URLs

Use consistent sizes to avoid layout shift:

| Use | TMDB size token |
|-----|-----------------|
| Poster card | `w342` |
| Hero backdrop | `w1280` |
| Thumbnail row | `w185` |

```ts
const posterUrl = (path: string | null) =>
  path ? `${process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE}/w342${path}` : '/placeholder-poster.jpg'
```

---

## Watch Page & Heartbeat

### Videasy embed

```tsx
// Movie
<iframe
  src={`https://player.videasy.to/movie/${tmdbId}`}
  allowFullScreen
  className="aspect-video w-full"
/>

// TV
<iframe
  src={`https://player.videasy.to/tv/${tmdbId}/${season}/${episode}`}
  ...
/>
```

### History logging (v1 — simple)

Videasy iframe does not expose progress events cross-origin. v1 approach:

1. **On mount:** `POST /history` → play start.
2. **On unmount / route leave:** `PATCH /history/:id` with `completed: false`, best-effort progress (0 if unknown).
3. **Manual "Mark as watched"** button as fallback.

### v1.1 (optional)

- `beforeunload` listener to PATCH last known state.
- If Videasy adds postMessage API later, subscribe for real progress.

### Heartbeat interval

If progress becomes available:

```ts
useEffect(() => {
  const id = setInterval(() => {
    patchHistory({ progressSeconds, completed: progress / duration > 0.9 })
  }, 30_000)
  return () => clearInterval(id)
}, [progressSeconds])
```

---

## Compare Page (`/compare`)

### Layout

Two-column on desktop, tabs on mobile:

```
┌────────────────────┬────────────────────┐
│  Tyler             │  Mike              │
│  Avg: 7.2 ★        │  Avg: 6.8 ★        │
│  142 rated         │  98 rated          │
├────────────────────┴────────────────────┤
│  Shared titles (both rated)             │
│  [poster grid with dual rating badges]  │
├─────────────────────────────────────────┤
│  Biggest disagreements (|diff| >= 4)   │
├─────────────────────────────────────────┤
│  Watchlist overlap / only-on-X lists    │
└─────────────────────────────────────────┘
```

### Data

Single request: `GET /imdb/compare` + `GET /watchlist/compare` in parallel.

Enrich with TMDB posters client-side only for IDs missing `posterPath` (batch `/tmdb/movie/:id` with query cache).

---

## Caching & Performance Budget

| Metric | Target |
|--------|--------|
| LCP (browse, warm cache) | < 2.0s |
| Search result appear | < 400ms after debounce |
| Row skeleton → content | < 300ms per row |
| TMDB detail page | < 1.5s TTFB |
| Compare page | < 1.0s (mostly our DB) |

### Techniques

1. **Parallel queries** — never waterfall TMDB calls on detail page; fetch movie + credits in one server route.
2. **`keepPreviousData`** — search and pagination without flash.
3. **Prefetch on hover** — `queryClient.prefetchQuery` when hovering poster card for 150ms+.
4. **Image priority** — `priority` on first row posters only (Next.js `Image` if using optimizer, or native `loading="lazy"` for rows 2+).
5. **Code split** — compare page charts/tables lazy loaded; player route minimal bundle.
6. **No TMDB on every render** — store title/poster in watch_events denormalized (backend already does this).

---

## Auth Gate Flow (client)

```
Landing (/)
  │
  ├─ No session cookie → show code input
  │     └─ POST /auth/verify-code → success → show user picker
  │           └─ POST /auth/select-user → redirect /browse
  │
  └─ Session valid → GET /auth/me
        ├─ userSlug set → redirect /browse
        └─ no userSlug → show user picker
```

Store nothing sensitive in `localStorage`. Session in **httpOnly cookie** only.

Middleware (`middleware.ts`) protects `/browse`, `/watch`, `/community`, `/compare`, `/profile`.

---

## Error & Empty States

| State | UX |
|-------|-----|
| No watch history yet | "Start watching — your rows will fill up" + link to search |
| Search no results | "Nothing found. Try another title." |
| IMDb import failed rows | Show count + downloadable CSV of unmapped titles |
| Videasy embed error | "Player unavailable — try again later" |
| MongoDB down | Friendly error boundary, retry button |
| Friend hasn't imported IMDb | Compare page shows half-empty with CTA to nudge them |

---

## Component Structure

```
components/
├── layout/
│   ├── Header.tsx              # logo, nav, active user badge
│   ├── Footer.tsx
│   └── SecretGate.tsx
├── browse/
│   ├── SearchBar.tsx
│   ├── SearchOverlay.tsx
│   ├── ContentRow.tsx          # horizontal scroll row
│   ├── PosterCard.tsx
│   └── HeroBanner.tsx          # optional featured title
├── watch/
│   ├── VideasyPlayer.tsx
│   └── MarkWatchedButton.tsx
├── community/
│   └── ActivityFeed.tsx
├── compare/
│   ├── RatingComparison.tsx
│   ├── DisagreementList.tsx
│   └── WatchlistOverlap.tsx
└── ui/
    ├── Skeleton.tsx
    ├── Badge.tsx
    └── Button.tsx
```

---

## State Management Rules

- **Server state:** TanStack Query only (no Redux).
- **UI state:** React `useState` / URL search params (`?q=` for search).
- **Session user:** React context from `GET /auth/me` on layout mount.
- **Optimistic updates:** watchlist add/remove only.

---

## API Client Pattern

```ts
// lib/api/client.ts
async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/v1${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!res.ok) throw new ApiError(res.status, await res.text())
  return res.json()
}

export const popular = {
  mostWatched: () => api<PopularRow[]>('/popular/most-watched'),
  thisWeek: () => api<PopularRow[]>('/popular/this-week'),
  recent: () => api<PopularRow[]>('/popular/recent'),
  continueWatching: () => api<PopularRow[]>('/popular/continue-watching'),
}
```

Centralized client keeps query functions one-liners and eases typing.

---

## Mobile Considerations

- Horizontal rows: `-webkit-overflow-scrolling: touch`, hide scrollbar.
- Search: full-screen overlay on `< 768px`.
- Compare: stack users vertically; swipe tabs for shared / disagreements / watchlist.
- Touch targets: min 44×44px (design.md).
- Player: full viewport, hide header on scroll/interaction.

---

## Testing Priorities (when ready)

1. Search debounce cancels stale requests.
2. Gate middleware redirects unauthenticated users.
3. Popular rows reflect watch events (integration test with seeded MongoDB).
4. IMDb CSV import maps known tt ID → TMDB ID.
5. Compare page renders with one user missing data.

---

## v1 Build Order

1. Secret gate + middleware + user picker
2. TMDB search + detail pages
3. Videasy watch page + history POST
4. User-popular rows on `/browse`
5. Community feed
6. IMDb import + compare page
7. Polish: skeletons, prefetch, empty states
