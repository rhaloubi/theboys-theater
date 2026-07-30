import { z } from "zod";
import { requireSession } from "@/lib/api/auth-middleware";
import { jsonData } from "@/lib/api/response";
import { clearUserFromSession } from "@/lib/auth/session";

export async function POST() {
  const session = await requireSession();
  if (!session.ok) return session.response;

  await clearUserFromSession(session.token);

  return jsonData({ success: true, needsUserSelection: true });
}
