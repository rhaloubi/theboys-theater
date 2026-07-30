import { requireSession, requireUser } from "@/lib/api/auth-middleware";
import { jsonData } from "@/lib/api/response";
import {
  getContinueWatching,
  getFriendActivity,
  getMostWatched,
  getRecent,
  getThisWeek,
} from "@/lib/db/popular";

export function createPopularHandler(
  type: "most-watched" | "this-week" | "recent" | "friend-activity" | "continue-watching",
) {
  return async function GET() {
    if (type === "continue-watching") {
      const session = await requireUser();
      if (!session.ok) return session.response;

      const result = await getContinueWatching(session.user.id);
      return jsonData({ items: result.items, isFallback: result.isFallback });
    }

    if (type === "friend-activity") {
      const session = await requireUser();
      if (!session.ok) return session.response;

      const result = await getFriendActivity(session.user.slug);
      return jsonData({ items: result.items, isFallback: result.isFallback });
    }

    const session = await requireSession();
    if (!session.ok) return session.response;

    const fetchers = {
      "most-watched": getMostWatched,
      "this-week": getThisWeek,
      recent: getRecent,
    } as const;

    const result = await fetchers[type]();
    return jsonData({ items: result.items, isFallback: result.isFallback });
  };
}
