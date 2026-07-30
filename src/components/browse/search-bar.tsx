"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { tmdbApi } from "@/lib/api/client";
import type { SearchMediaFilter } from "@/lib/tmdb/types";
import { posterUrl, titleHref } from "@/lib/utils/images";
import { SearchSkeleton } from "@/components/ui/skeleton";

const CATEGORIES: { id: SearchMediaFilter; label: string }[] = [
  { id: "tv", label: "Séries" },
  { id: "movie", label: "Films" },
];

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SearchMediaFilter>("tv");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebouncedValue(query, 300);

  const { data, isFetching, isError } = useQuery({
    queryKey: ["tmdb", "search", debouncedQuery, category],
    queryFn: ({ signal }) =>
      tmdbApi.search(debouncedQuery, category, signal),
    enabled: debouncedQuery.length >= 2,
    staleTime: 120_000,
  });

  const results = data?.results ?? [];
  const showDropdown = open && debouncedQuery.length >= 2;

  useEffect(() => {
    setActiveIndex(0);
  }, [debouncedQuery, category, results.length]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showDropdown || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = results[activeIndex];
      if (item) {
        window.location.href = titleHref(item.tmdbId, item.mediaType);
      }
    }
  }

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <span className="text-muted pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-base">
          ⌕
        </span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder="Search…"
          className="h-12 w-full rounded-md border border-border/60 bg-surface/80 py-3 pr-4 pl-11 text-base outline-none transition-colors placeholder:text-muted focus:border-border focus:bg-surface"
        />
      </div>

      <div className="mt-5 flex items-center justify-center gap-10">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategory(cat.id)}
            className={`text-base transition-colors ${
              category === cat.id
                ? "font-medium text-foreground"
                : "text-muted hover:text-foreground/80"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {showDropdown && (
        <div className="absolute top-full z-50 mt-3 max-h-[60vh] w-full overflow-y-auto rounded-lg border border-border bg-surface-elevated shadow-[0_8px_24px_rgba(0,0,0,0.6)]">
          {isFetching && <SearchSkeleton />}
          {!isFetching && isError && (
            <p className="text-muted p-4 text-sm">Search failed. Try again.</p>
          )}
          {!isFetching && !isError && results.length === 0 && (
            <p className="text-muted p-4 text-sm">Nothing found.</p>
          )}
          {!isFetching &&
            results.map((item, index) => (
              <Link
                key={`${item.mediaType}-${item.tmdbId}`}
                href={titleHref(item.tmdbId, item.mediaType)}
                className={`flex gap-3 p-3 transition-colors hover:bg-background ${
                  index === activeIndex ? "bg-background" : ""
                }`}
              >
                <div className="relative h-[69px] w-[46px] shrink-0 overflow-hidden rounded bg-surface">
                  <Image
                    src={posterUrl(item.posterPath, "w185")}
                    alt=""
                    fill
                    sizes="46px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.title}</p>
                  <p className="text-muted text-xs capitalize">
                    {item.mediaType === "tv" ? "Série" : "Film"}
                    {item.releaseDate ? ` · ${item.releaseDate.slice(0, 4)}` : ""}
                  </p>
                </div>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}
