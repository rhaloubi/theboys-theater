export function RowSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-6 w-48 animate-pulse rounded bg-surface" />
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[2/3] w-[140px] shrink-0 animate-pulse rounded-sm bg-surface"
          />
        ))}
      </div>
    </div>
  );
}

export function PosterSkeleton() {
  return (
    <div className="aspect-[2/3] w-[140px] shrink-0 animate-pulse rounded-sm bg-surface" />
  );
}

export function SearchSkeleton() {
  return (
    <div className="space-y-2 p-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-3 rounded p-2">
          <div className="h-[69px] w-[46px] shrink-0 animate-pulse rounded bg-surface" />
          <div className="flex flex-1 flex-col justify-center gap-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-surface" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-surface" />
          </div>
        </div>
      ))}
    </div>
  );
}
