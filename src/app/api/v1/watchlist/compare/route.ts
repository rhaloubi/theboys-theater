import { requireSession } from "@/lib/api/auth-middleware";
import { withErrorHandling } from "@/lib/api/route-handler";
import { jsonData } from "@/lib/api/response";
import { getWatchlistCompare } from "@/lib/db/watchlist-compare";

export async function GET() {
  return withErrorHandling(async () => {
    const session = await requireSession();
    if (!session.ok) return session.response;

    const data = await getWatchlistCompare();
    return jsonData(data);
  });
}
