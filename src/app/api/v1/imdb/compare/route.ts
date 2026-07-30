import { requireSession } from "@/lib/api/auth-middleware";
import { withErrorHandling } from "@/lib/api/route-handler";
import { jsonData } from "@/lib/api/response";
import { getImdbCompare } from "@/lib/db/imdb-compare";

export async function GET() {
  return withErrorHandling(async () => {
    const session = await requireSession();
    if (!session.ok) return session.response;

    const data = await getImdbCompare();
    return jsonData(data);
  });
}
