export interface ParsedImdbRow {
  imdbId: string;
  title: string;
  year: number | null;
  rating: number;
  ratedAt: Date | null;
}

export function parseImdbCsv(content: string): ParsedImdbRow[] {
  const lines = content.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  const header = parseCsvLine(lines[0]).map((h) => h.trim());
  const constIdx = header.findIndex((h) => h === "Const");
  const titleIdx = header.findIndex((h) => h === "Title");
  const yearIdx = header.findIndex((h) => h === "Year");
  const ratingIdx = header.findIndex((h) => h === "You rated");
  const dateIdx = header.findIndex((h) => h === "Date Rated");

  if (constIdx === -1 || ratingIdx === -1) {
    throw new Error("Invalid IMDb CSV: missing Const or You rated columns");
  }

  const rows: ParsedImdbRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const imdbId = cols[constIdx]?.trim();
    const rating = Number(cols[ratingIdx]);
    if (!imdbId?.startsWith("tt") || !Number.isFinite(rating)) continue;

    const yearRaw = yearIdx >= 0 ? cols[yearIdx]?.trim() : "";
    const year = yearRaw ? Number(yearRaw) : null;

    let ratedAt: Date | null = null;
    if (dateIdx >= 0 && cols[dateIdx]) {
      const parsed = new Date(cols[dateIdx]);
      if (!Number.isNaN(parsed.getTime())) ratedAt = parsed;
    }

    rows.push({
      imdbId,
      title: titleIdx >= 0 ? cols[titleIdx]?.trim() || "Unknown" : "Unknown",
      year: Number.isFinite(year) ? year : null,
      rating,
      ratedAt,
    });
  }

  return rows;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  result.push(current);
  return result;
}
