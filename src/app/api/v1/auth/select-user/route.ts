import { z } from "zod";
import {
  attachUserToSession,
  profileCookieOptions,
} from "@/lib/auth/session";
import { requireSession } from "@/lib/api/auth-middleware";
import { withErrorHandling } from "@/lib/api/route-handler";
import { jsonData, jsonError, parseJsonBody } from "@/lib/api/response";
import { connectDB } from "@/lib/db/mongodb";
import { User } from "@/lib/models";

const selectUserSchema = z.object({
  userSlug: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await parseJsonBody<unknown>(request);
  if (body instanceof Response) return body;

  return withErrorHandling(async () => {
    const session = await requireSession();
    if (!session.ok) return session.response;

    const parsed = selectUserSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("userSlug is required", 400, "VALIDATION_ERROR");
    }

    await connectDB();
    const user = await User.findOne({
      slug: parsed.data.userSlug.toLowerCase(),
    });
    if (!user) {
      return jsonError("User not found", 404, "USER_NOT_FOUND");
    }

    await attachUserToSession(session.token, user._id.toString());

    const response = jsonData({
      user: {
        id: user._id.toString(),
        slug: user.slug,
        displayName: user.displayName,
        avatarColor: user.avatarColor ?? "#e50914",
      },
    });
    response.cookies.set(profileCookieOptions(user.slug));
    return response;
  });
}

export async function GET() {
  return withErrorHandling(async () => {
    const session = await requireSession();
    if (!session.ok) return session.response;

    await connectDB();
    const users = await User.find().sort({ createdAt: 1 }).lean();

    return jsonData({
      users: users.map((u) => ({
        slug: u.slug,
        displayName: u.displayName,
        avatarColor: u.avatarColor ?? "#e50914",
      })),
    });
  });
}
