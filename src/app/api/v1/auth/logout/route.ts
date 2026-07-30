import {
  clearSessionCookieOptions,
  deleteSession,
} from "@/lib/auth/session";
import { requireSession } from "@/lib/api/auth-middleware";
import { jsonData } from "@/lib/api/response";

export async function POST() {
  const session = await requireSession();
  if (session.ok) {
    await deleteSession(session.token);
  }

  const response = jsonData({ success: true });
  response.cookies.set(clearSessionCookieOptions());
  return response;
}
