# The Boys Theater — Design System

> Netflix-inspired cinema aesthetic for a private two-user streaming hub. Dark-first, content-forward, minimal chrome.

---

## Design Tokens

```yaml
version: alpha
name: The Boys Theater
description: "Private streaming hub — movies, TV, and friendly competition."
basedOn: Netflix design system (adapted)

colors:
  primary: "#e50914"           # Netflix red — play, CTAs, active states
  on-primary: "#ffffff"
  background: "#141414"        # Slightly deeper than Netflix for OLED
  surface: "#2d2d2d"           # Cards, modals, input fields
  surface-elevated: "#3a3a3a" # Hover states, dropdowns
  border: "#564d4d"            # Subtle dividers (warmer gray)
  text: "#ffffff"
  text-muted: "#b3b3b3"        # Secondary labels, timestamps
  text-disabled: "#808080"
  success: "#46d369"           # "Watched", agreement badges
  warning: "#ffa500"           # Rating disagreement highlight
  accent-secondary: "#0071eb"  # Friend B accent (optional per-user)

typography:
  fontFamily: "'Netflix Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif"
  display:
    fontSize: clamp(48px, 8vw, 100px)
    fontWeight: 400
    lineHeight: 1.1
  heading:
    fontSize: clamp(24px, 4vw, 56px)
    fontWeight: 700
    lineHeight: 1.25
  title:
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4

spacing:
  base: 4px
  scale: [4, 8, 12, 16, 24, 32, 48, 64, 96]

radius:
  sm: 2px
  md: 4px
  lg: 8px
  xl: 16px
  full: 9999px

shadows:
  card: "0 2px 8px rgba(0, 0, 0, 0.45)"
  elevated: "0 8px 24px rgba(0, 0, 0, 0.6)"
  poster-hover: "0 4px 20px rgba(229, 9, 20, 0.25)"

motion:
  duration-fast: 200ms
  duration-base: 300ms
  duration-slow: 500ms
  easing: "cubic-bezier(0.4, 0, 0.68, 0.06)"

breakpoints:
  sm: 640px
  md: 768px
  lg: 1024px
  xl: 1280px
  2xl: 1536px
```

---

## Rationale

The Boys Theater inherits Netflix's **content-first, dark cinema** language: near-black backgrounds let poster art dominate; red signals play and urgency; typography stays neutral so titles and imagery carry emotion.

Adaptations for this product:

- **Deeper background (`#141414`)** — slightly richer blacks for a "private theater" feel.
- **`text-muted` fixed to `#b3b3b3`** — the source Netflix token listed `#000000`, which is unusable on dark UI; we use Netflix's actual secondary gray.
- **Success/warning colors** — support the compare page (rating agreement vs disagreement).
- **Per-user accent (optional)** — subtle color on avatars/badges to distinguish Tyler vs Mike without breaking the two-tone palette.

Motion stays functional: 300ms transitions for hovers and row scrolls; no decorative animation. Respect `prefers-reduced-motion`.

---

## Visual Theme & Atmosphere

**Premium private screening room** — not a corporate landing page. The gate page can be playful (inside joke copy); once inside, the UI is clean Netflix-like browsing.

| Zone | Mood |
|------|------|
| Gate (`/`) | Playful, minimal, one focal input |
| Browse (`/browse`) | Confident, scannable rows, search always reachable |
| Watch | Immersive, chrome fades, black letterbox |
| Compare | Social, competitive-but-fun, dual-column stats |
| Community | Timeline, human names prominent |

---

## Color Usage

| Token | Use |
|-------|-----|
| `primary` | Play buttons, primary CTAs, focus rings, logo accent |
| `background` | Page canvas, full-bleed sections |
| `surface` | Search bar, cards, modals, gate input |
| `surface-elevated` | Dropdown results, hovered cards |
| `border` | Input borders, row dividers |
| `text` | Titles, body |
| `text-muted` | "Watched 2h ago", episode labels, metadata |
| `success` | Both users rated 8+, watchlist overlap |
| `warning` | Rating diff ≥ 4, playful "disagreement" badge |

**Red usage rule:** Red backgrounds only on buttons/CTAs with white text — never red text on dark bg for body copy (fails contrast).

---

## Typography Scale

| Role | Size | Weight | Example |
|------|------|--------|---------|
| Display | clamp 48–100px | 400 | Gate hero headline |
| Heading | clamp 24–56px | 700 | "Most Watched Between Us" |
| Title | 20px | 600 | Movie name on detail page |
| Body | 14px | 400 | Descriptions, nav links |
| Caption | 12px | 400 | Timestamps, IMDb import date |

Section row titles on browse: **20px semibold**, white, left-aligned with optional "See all" caption link in `text-muted`.

---

## Layout & Spacing

Base unit **4px**. Common patterns:

| Pattern | Spacing |
|---------|---------|
| Page horizontal padding | 16px mobile → 48px desktop |
| Between content rows | 32px vertical |
| Poster card gap in row | 8px |
| Card internal padding | 16px |
| Header height | 64px |
| Search bar height | 44px (touch target) |

### Browse page structure

```
┌──────────────────────────────────────────────┐
│  [Logo]  Browse  Community  Compare    [You] │  ← sticky header
├──────────────────────────────────────────────┤
│  [🔍 Search movies & shows...]               │
├──────────────────────────────────────────────┤
│  Continue Watching                           │
│  [▶][▶][▶][▶] → horizontal scroll            │
├──────────────────────────────────────────────┤
│  Recently Watched (Both)                     │
│  [▶][▶][▶][▶] →                               │
├──────────────────────────────────────────────┤
│  Most Watched Between Us                     │
│  [▶][▶][▶][▶] →                               │
├──────────────────────────────────────────────┤
│  Hot This Week                               │
│  [▶][▶][▶][▶] →                               │
└──────────────────────────────────────────────┘
```

---

## Components

### Header

- Background: `background` at 95% opacity + `backdrop-blur` when scrolled.
- Logo: wordmark "The Boys Theater" or short "TBT" — white with red dot/accent.
- Nav links: body size, `text-muted` default → `text` on hover/active (underline or red bottom border).
- User badge: circle avatar with initial + `displayName`, optional per-user accent ring.

### Secret gate

- Full viewport centered layout.
- Display headline: inside joke (configurable string).
- Single input: `surface` bg, `border` default, `primary` border on focus.
- Submit button: full `primary`, white text, min height 48px.
- Wrong code: shake animation (200ms) + muted error text — no harsh red wall of text.

### Search bar

- Default: pill or rectangle on `surface`, icon left, placeholder `text-muted`.
- Focus: `primary` 2px outline, offset 2px.
- Overlay results: `surface-elevated` dropdown, max-height 60vh, scroll.
- Result row: poster thumbnail 46×69, title + year + media type badge.

### Content row (`ContentRow`)

- Title row: heading left, optional chevron "See all" right.
- Horizontal scroll container, `scroll-snap-type: x mandatory`.
- Fade mask on right edge (gradient to `background`) hinting more content.

### Poster card

- Aspect ratio **2:3** (standard movie poster).
- Default: no radius or `radius-sm`.
- Hover (desktop): scale 1.08, `poster-hover` shadow, 300ms ease. z-index lift.
- Overlay on hover: dark gradient bottom, title + play icon.
- Badges: watch count pill (top-right), "Friend watched" dot (top-left).

### Play button

- Circle or pill, `primary` bg, white play icon.
- Min 48×48px touch target.
- On detail hero: large pill "▶ Play" + secondary "More Info" ghost button.

### Activity feed (community)

- Vertical list, each item: avatar + "`Mike` watched **`Breaking Bad`** S1E3" + relative time.
- Divider: 1px `border` between items.
- Poster thumb 40px wide optional on right.

### Compare page

- **Stat cards:** two side-by-side, `surface` bg, large avg rating number (heading scale), caption for count.
- **Dual rating badge on shared titles:**
  ```
  ┌─────────┐
  │ poster  │
  │  T: 9   │  ← small pills, user accent colors
  │  M: 7   │
  └─────────┘
  ```
- **Disagreement row:** `warning` left border 3px + diff number badge.
- **Watchlist overlap:** Venn-style or two lists with shared section highlighted in `success` tint.

### Videasy player wrapper

- Full width, `aspect-video`, black letterbox background.
- Minimal controls chrome above: back arrow, title, episode selector (TV).
- Header auto-hides after 3s idle on watch page.

### Skeleton loaders

- `surface` base + shimmer animation (linear-gradient sweep).
- Match poster 2:3 ratio exactly to prevent layout shift.

### Buttons

| Variant | Style |
|---------|-------|
| Primary | `primary` bg, `on-primary` text, no border |
| Secondary | transparent, `border` 1px, `text` |
| Ghost | transparent, `text-muted`, hover `text` |
| Danger | transparent, `primary` text (destructive actions only) |

---

## Responsive Behavior

| Breakpoint | Posters per row (visible) | Notes |
|------------|---------------------------|-------|
| < 640px | 2.5 (peek) | Full-width search overlay |
| 640–1024px | 3.5 | Nav collapses to icons optional |
| 1024–1280px | 5 | Standard desktop |
| > 1280px | 6–7 | Max content width 1920px centered |

Compare page: **stacked tabs** on mobile (`Shared` | `Disagreements` | `Watchlist`).

---

## Motion & Interaction

| Interaction | Duration | Easing |
|-------------|----------|--------|
| Poster hover scale | 300ms | default easing |
| Row scroll snap | native | — |
| Search overlay fade | 200ms | ease-out |
| Gate error shake | 200ms | linear |
| Page transition | 0ms v1 | instant route change |

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Body text contrast | White on `#141414` ≈ 19:1 (AAA) |
| Muted text | `#b3b3b3` on `#141414` ≈ 9:1 (AAA) |
| Primary button | White on `#e50914` ≈ 4.6:1 (AA) |
| Focus visible | 2px `primary` outline, 2px offset |
| Touch targets | ≥ 44×44px |
| Keyboard | Search overlay trap focus; Esc closes |
| Images | `alt={title}` on all posters |
| Motion | `prefers-reduced-motion` respected |

---

## Tailwind Mapping

```js
// tailwind.config excerpt
theme: {
  extend: {
    colors: {
      primary: '#e50914',
      background: '#141414',
      surface: '#2d2d2d',
      'surface-elevated': '#3a3a3a',
      border: '#564d4d',
      muted: '#b3b3b3',
      success: '#46d369',
      warning: '#ffa500',
    },
    fontFamily: {
      sans: ['Netflix Sans', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
    },
    transitionTimingFunction: {
      netflix: 'cubic-bezier(0.4, 0, 0.68, 0.06)',
    },
  },
}
```

---

## Copy & Tone

| Context | Tone |
|---------|------|
| Gate | Inside joke, warm, short |
| Empty rows | Encouraging, not corporate |
| Compare disagreements | Playful roast energy ("You rated this a 10??") |
| Errors | Brief, human ("Player's taking a break") |

---

## Assets Checklist

- [ ] Logo / wordmark (SVG)
- [ ] Placeholder poster (`/public/placeholder-poster.jpg`)
- [ ] Favicon
- [ ] Optional: custom gate illustration
- [ ] User avatar fallback (initials)

---

## Page-Specific Notes

### Gate page

- No header nav — single focus.
- Background: optional subtle backdrop from TMDB (blurred, darkened 80%).
- Code input: monospace optional for "secret code" vibe.

### Browse

- Sticky search below header on scroll (compact mode).
- First row always "Continue Watching" if data exists; hide row entirely if empty.

### Compare

- Hero stat: "Tyler avg 7.2 vs Mike avg 6.8" with subtle competition framing.
- Export not needed v1; import CTA prominent if friend hasn't uploaded IMDb CSV.

---

## v1 vs v2 Polish

**v1 (ship fast):**
- Core tokens, poster rows, gate, basic compare layout.

**v2 (later):**
- Hero banner with featured title (most watched between you).
- Animated row arrows on desktop hover.
- Custom Netflix Sans webfont files (licensing) — fall back to system sans for v1.
