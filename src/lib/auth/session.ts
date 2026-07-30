import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth/cookies";
import { connectDB } from "@/lib/db/mongodb";
import { Session, User, type IUser } from "@/lib/models";
import type { SessionUser } from "@/lib/types";

export { SESSION_COOKIE, PROFILE_COOKIE } from "@/lib/auth/cookies";
export {
  sessionCookieOptions,
  clearSessionCookieOptions,
  profileCookieOptions,
  clearProfileCookieOptions,
} from "@/lib/auth/cookies";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function hashGateCode(code: string): string {
  const secret = process.env.SESSION_SECRET ?? "dev-secret";
  return createHash("sha256").update(`${code}:${secret}`).digest("hex");
}

export function verifyGateCode(code: string): boolean {
  const expected = process.env.GATE_CODE_HASH;
  if (expected) {
    return hashGateCode(code) === expected;
  }

  const plain = process.env.GATE_CODE;
  if (plain) {
    return code === plain;
  }

  return process.env.NODE_ENV === "development" && code === "theboys";
}

export function hashDeleteProfileCode(code: string): string {
  const secret = process.env.SESSION_SECRET ?? "dev-secret";
  return createHash("sha256")
    .update(`delete-profile:${code}:${secret}`)
    .digest("hex");
}

export function verifyDeleteProfileCode(code: string): boolean {
  const expected = process.env.DELETE_PROFILE_CODE_HASH;
  if (expected) {
    return hashDeleteProfileCode(code) === expected;
  }

  const plain = process.env.DELETE_PROFILE_CODE;
  if (plain) {
    return code === plain;
  }

  return process.env.NODE_ENV === "development" && code === "diabolical";
}

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export async function createSession(userId?: string): Promise<string> {
  await connectDB();

  const token = generateSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await Session.create({
    tokenHash,
    userId: userId ?? null,
    expiresAt,
  });

  return token;
}

export async function attachUserToSession(
  token: string,
  userId: string,
): Promise<void> {
  await connectDB();
  const tokenHash = hashToken(token);

  await Session.findOneAndUpdate(
    { tokenHash, expiresAt: { $gt: new Date() } },
    { userId },
  );
}

export async function clearUserFromSession(token: string): Promise<void> {
  await connectDB();
  const tokenHash = hashToken(token);

  await Session.findOneAndUpdate(
    { tokenHash, expiresAt: { $gt: new Date() } },
    { userId: null },
  );
}

export async function deleteSession(token: string): Promise<void> {
  await connectDB();
  await Session.deleteOne({ tokenHash: hashToken(token) });
}

export async function getSessionFromToken(token: string) {
  await connectDB();
  const tokenHash = hashToken(token);

  return Session.findOne({
    tokenHash,
    expiresAt: { $gt: new Date() },
  }).populate<{ userId: IUser | null }>("userId");
}

export async function getSessionUser(): Promise<{
  token: string | null;
  user: SessionUser | null;
  needsUserSelection: boolean;
}> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value ?? null;

  if (!token) {
    return { token: null, user: null, needsUserSelection: false };
  }

  const session = await getSessionFromToken(token);
  if (!session) {
    return { token: null, user: null, needsUserSelection: false };
  }

  if (!session.userId) {
    return { token, user: null, needsUserSelection: true };
  }

  const user =
    typeof session.userId === "object" && session.userId !== null
      ? session.userId
      : await User.findById(session.userId);

  if (!user) {
    return { token, user: null, needsUserSelection: true };
  }

  return {
    token,
    user: {
      id: user._id.toString(),
      slug: user.slug,
      displayName: user.displayName,
      avatarColor: user.avatarColor ?? "#e50914",
    },
    needsUserSelection: false,
  };
}

