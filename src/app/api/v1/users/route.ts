import { z } from "zod";
import { requireSession } from "@/lib/api/auth-middleware";
import { withErrorHandling } from "@/lib/api/route-handler";
import { jsonData, jsonError, parseJsonBody } from "@/lib/api/response";
import {
  MAX_PROFILES,
  PROFILE_AVATAR_COLORS,
} from "@/lib/constants/profiles";
import { connectDB } from "@/lib/db/mongodb";
import { User } from "@/lib/models";
import { generateUniqueSlug } from "@/lib/users/slug";

const createProfileSchema = z.object({
  displayName: z.string().trim().min(1).max(20),
});

export async function POST(request: Request) {
  const body = await parseJsonBody<unknown>(request);
  if (body instanceof Response) return body;

  return withErrorHandling(async () => {
    const session = await requireSession();
    if (!session.ok) return session.response;

    const parsed = createProfileSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Name must be 1–20 characters", 400, "VALIDATION_ERROR");
    }

    await connectDB();

    const count = await User.countDocuments();
    if (count >= MAX_PROFILES) {
      return jsonError(
        `Maximum ${MAX_PROFILES} profiles reached`,
        400,
        "MAX_PROFILES",
      );
    }

    const displayName = parsed.data.displayName.trim();
    const slug = await generateUniqueSlug(displayName);
    const avatarColor =
      PROFILE_AVATAR_COLORS[count % PROFILE_AVATAR_COLORS.length];

    const user = await User.create({
      slug,
      displayName,
      avatarColor,
    });

    return jsonData({
      user: {
        slug: user.slug,
        displayName: user.displayName,
        avatarColor: user.avatarColor ?? avatarColor,
      },
      totalProfiles: count + 1,
      maxProfiles: MAX_PROFILES,
    });
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
      totalProfiles: users.length,
      maxProfiles: MAX_PROFILES,
      canAddProfile: users.length < MAX_PROFILES,
    });
  });
}
