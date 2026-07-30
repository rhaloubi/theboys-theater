import { getSessionUser } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/route-handler";
import { jsonData } from "@/lib/api/response";
import type { AuthMeResponse } from "@/lib/types";

export async function GET() {
  return withErrorHandling(async () => {
    const session = await getSessionUser();

    const body: AuthMeResponse = {
      authenticated: Boolean(session.token),
      user: session.user,
      needsUserSelection: session.needsUserSelection,
    };

    return jsonData(body);
  });
}
