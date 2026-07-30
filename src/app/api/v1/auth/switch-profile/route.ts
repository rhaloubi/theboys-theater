import { requireSession } from "@/lib/api/auth-middleware";
import { withErrorHandling } from "@/lib/api/route-handler";
import { jsonData } from "@/lib/api/response";
import { clearProfileCookieOptions, clearUserFromSession } from "@/lib/auth/session";

export async function POST() {
  return withErrorHandling(async () => {
    const session = await requireSession();
    if (!session.ok) return session.response;

    await clearUserFromSession(session.token);

    const response = jsonData({ success: true, needsUserSelection: true });
    response.cookies.set(clearProfileCookieOptions());
    return response;
  });
}
