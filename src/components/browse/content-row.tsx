import { PosterCard } from "@/components/browse/poster-card";
import { RowSkeleton } from "@/components/ui/skeleton";
import type { PopularRowItem } from "@/lib/types";

interface ContentRowProps {
  title: string;
  subtitle?: string;
  items: PopularRowItem[];
  isLoading?: boolean;
  emptyMessage?: string;
  showWatchCount?: boolean;
  preferWatchLink?: boolean;
}

export function ContentRow({
  title,
  subtitle,
  items,
  isLoading,
  emptyMessage,
  showWatchCount = false,
  preferWatchLink = false,
}: ContentRowProps) {
  if (isLoading) {
    return <RowSkeleton />;
  }

  if (items.length === 0) {
    if (emptyMessage) {
      return (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold md:text-xl">{title}</h2>
          <p className="text-muted text-sm">{emptyMessage}</p>
        </section>
      );
    }
    return null;
  }

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold md:text-xl">{title}</h2>
        {subtitle && <p className="text-muted text-sm">{subtitle}</p>}
      </div>
      <div className="relative -mx-4 md:-mx-12">
        <div className="flex gap-2 overflow-x-auto px-4 pb-2 scroll-smooth snap-x snap-mandatory scrollbar-none md:px-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => (
            <PosterCard
              key={`${item.mediaType}-${item.tmdbId}-${item.seasonNumber ?? 0}-${item.episodeNumber ?? 0}`}
              item={item}
              showWatchCount={showWatchCount}
              preferWatchLink={preferWatchLink}
            />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent" />
      </div>
    </section>
  );
}
