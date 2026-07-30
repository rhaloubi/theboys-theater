import {
  clearSessionCookieOptions,
  deleteSession,
} from "@/lib/auth/session";
import { requireSession } from "@/lib/api/auth-middleware";
import { withErrorHandling } from "@/lib/api/route-handler";
import { jsonData } from "@/lib/api/response";

export async function POST() {
  return withErrorHandling(async () => {
    const session = await requireSession();
    if (session.ok) {
      await deleteSession(session.token);
    }

    const response = jsonData({ success: true });
    response.cookies.set(clearSessionCookieOptions());
    return response;
  });
}
