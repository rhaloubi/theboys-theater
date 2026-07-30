import { getSessionUser } from "@/lib/auth/session";
import { jsonData } from "@/lib/api/response";
import type { AuthMeResponse } from "@/lib/types";

export async function GET() {
  const session = await getSessionUser();

  const body: AuthMeResponse = {
    authenticated: Boolean(session.token),
    user: session.user,
    needsUserSelection: session.needsUserSelection,
  };

  return jsonData(body);
}
