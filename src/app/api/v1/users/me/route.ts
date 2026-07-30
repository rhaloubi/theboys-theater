import { z } from "zod";
import { requireUser } from "@/lib/api/auth-middleware";
import { withErrorHandling } from "@/lib/api/route-handler";
import { jsonData, jsonError, parseJsonBody } from "@/lib/api/response";
import {
  clearProfileCookieOptions,
  clearSessionCookieOptions,
  clearUserFromSession,
  verifyDeleteProfileCode,
} from "@/lib/auth/session";
import { connectDB } from "@/lib/db/mongodb";
import {
  ImdbRating,
  Session,
  User,
  WatchEvent,
  Watchlist,
} from "@/lib/models";

const deleteProfileSchema = z.object({
  code: z.string().min(1),
});

export async function DELETE(request: Request) {
  const body = await parseJsonBody<unknown>(request);
  if (body instanceof Response) return body;

  return withErrorHandling(async () => {
    const session = await requireUser();
    if (!session.ok) return session.response;

    const parsed = deleteProfileSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Confirmation code is required", 400, "VALIDATION_ERROR");
    }

    if (!verifyDeleteProfileCode(parsed.data.code)) {
      return jsonError("Wrong code. Nice try.", 403, "INVALID_DELETE_CODE");
    }

    await connectDB();

    const profileCount = await User.countDocuments();
    if (profileCount <= 1) {
      return jsonError(
        "Cannot delete the last profile",
        400,
        "LAST_PROFILE",
      );
    }

    const userId = session.user.id;

    await Promise.all([
      WatchEvent.deleteMany({ userId }),
      Watchlist.deleteMany({ userId }),
      ImdbRating.deleteMany({ userId }),
      Session.updateMany({ userId }, { userId: null }),
    ]);

    await User.findByIdAndDelete(userId);
    await clearUserFromSession(session.token);

    const response = jsonData({ success: true, needsUserSelection: true });
    response.cookies.set(clearProfileCookieOptions());
    return response;
  });
}
