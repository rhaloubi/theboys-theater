import Link from "next/link";
import Image from "next/image";
import { posterUrl, titleHref, watchHref } from "@/lib/utils/images";
import type { PopularRowItem } from "@/lib/types";

interface PosterCardProps {
  item: Pick<
    PopularRowItem,
    | "tmdbId"
    | "mediaType"
    | "title"
    | "posterPath"
    | "watchCount"
    | "lastWatchedBy"
    | "seasonNumber"
    | "episodeNumber"
  >;
  showWatchCount?: boolean;
  preferWatchLink?: boolean;
}

export function PosterCard({
  item,
  showWatchCount = false,
  preferWatchLink = false,
}: PosterCardProps) {
  const href = preferWatchLink
    ? watchHref(
        item.tmdbId,
        item.mediaType,
        item.seasonNumber,
        item.episodeNumber,
      )
    : titleHref(
        item.tmdbId,
        item.mediaType,
        item.seasonNumber,
        item.episodeNumber,
      );

  return (
    <Link
      href={href}
      className="group relative block w-[140px] shrink-0 snap-start scroll-ml-4"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-sm bg-surface transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.68,0.06)] group-hover:z-10 group-hover:scale-105 group-hover:shadow-[0_4px_20px_rgba(229,9,20,0.25)]">
        <Image
          src={posterUrl(item.posterPath, "w342")}
          alt={item.title}
          fill
          sizes="140px"
          className="object-cover"
        />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
          <div className="p-2">
            <p className="line-clamp-2 text-xs font-semibold text-white">
              {item.title}
            </p>
          </div>
        </div>
        {showWatchCount && item.watchCount > 0 && (
          <span className="absolute top-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            {item.watchCount}×
          </span>
        )}
        {item.lastWatchedBy && (
          <span
            className="absolute top-2 left-2 h-2 w-2 rounded-full bg-primary"
            title={`Last watched by ${item.lastWatchedBy}`}
          />
        )}
      </div>
    </Link>
  );
}
