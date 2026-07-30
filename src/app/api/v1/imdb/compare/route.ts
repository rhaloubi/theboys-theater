import { requireSession } from "@/lib/api/auth-middleware";
import { jsonData } from "@/lib/api/response";
import { getImdbCompare } from "@/lib/db/imdb-compare";

export async function GET() {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const data = await getImdbCompare();
  return jsonData(data);
}
