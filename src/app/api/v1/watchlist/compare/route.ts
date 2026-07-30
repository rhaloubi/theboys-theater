import { requireSession } from "@/lib/api/auth-middleware";
import { jsonData } from "@/lib/api/response";
import { getWatchlistCompare } from "@/lib/db/watchlist-compare";

export async function GET() {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const data = await getWatchlistCompare();
  return jsonData(data);
}
