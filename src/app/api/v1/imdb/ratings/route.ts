import { requireUser } from "@/lib/api/auth-middleware";
import { jsonData } from "@/lib/api/response";
import { getImdbRatings } from "@/lib/db/imdb-compare";

export async function GET(request: Request) {
  const session = await requireUser();
  if (!session.ok) return session.response;

  const { searchParams } = new URL(request.url);
  const userSlug = searchParams.get("userSlug") ?? session.user.slug;

  const ratings = await getImdbRatings(userSlug);
  return jsonData({ ratings });
}
