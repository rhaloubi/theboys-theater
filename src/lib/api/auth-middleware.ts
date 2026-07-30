import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { jsonError } from "@/lib/api/response";
import type { SessionUser } from "@/lib/types";

export async function requireSession(): Promise<
  | { ok: true; token: string; user: SessionUser | null; needsUserSelection: boolean }
  | { ok: false; response: NextResponse }
> {
  const session = await getSessionUser();

  if (!session.token) {
    return { ok: false, response: jsonError("Unauthorized", 401, "UNAUTHORIZED") };
  }

  return {
    ok: true,
    token: session.token,
    user: session.user,
    needsUserSelection: session.needsUserSelection,
  };
}

export async function requireUser(): Promise<
  | { ok: true; token: string; user: SessionUser }
  | { ok: false; response: NextResponse }
> {
  const session = await requireSession();
  if (!session.ok) return session;

  if (!session.user) {
    return {
      ok: false,
      response: jsonError(
        "Select a user profile first",
        403,
        "USER_NOT_SELECTED",
      ),
    };
  }

  return { ok: true, token: session.token, user: session.user };
}
