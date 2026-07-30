const RED = "#e50914";

interface TbtLogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
}

const markSizes = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-xs",
  lg: "h-12 w-12 text-sm",
};

export function TbtLogo({
  className = "",
  showWordmark = true,
  size = "md",
}: TbtLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <TbtMark size={size} />
      {showWordmark && (
        <span className="hidden font-semibold tracking-tight text-foreground sm:inline">
          The Boys Theater
        </span>
      )}
    </span>
  );
}

export function TbtMark({
  className = "",
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-md bg-[#141414] font-bold tracking-tighter ring-1 ring-white/10 ${markSizes[size]} ${className}`}
      style={{ color: RED }}
      aria-label="TBT"
    >
      TBT
    </span>
  );
}
