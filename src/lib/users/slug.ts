import { randomBytes } from "crypto";
import { connectDB } from "@/lib/db/mongodb";
import { User } from "@/lib/models";

export function slugifyDisplayName(name: string): string {
  const base =
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "profile";
  return base.slice(0, 24);
}

export async function generateUniqueSlug(displayName: string): Promise<string> {
  await connectDB();
  const base = slugifyDisplayName(displayName);

  for (let attempt = 0; attempt < 10; attempt++) {
    const suffix = randomBytes(2).toString("hex");
    const slug = `${base}-${suffix}`;
    const exists = await User.exists({ slug });
    if (!exists) return slug;
  }

  return `${base}-${randomBytes(4).toString("hex")}`;
}
