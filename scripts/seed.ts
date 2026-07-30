import { connectDB } from "../src/lib/db/mongodb";
import { User } from "../src/lib/models";

const DEFAULT_USERS = [
  {
    slug: "user-a",
    displayName: "User A",
    avatarColor: "#e50914",
  },
  {
    slug: "user-b",
    displayName: "User B",
    avatarColor: "#0071eb",
  },
] as const;

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set. Copy .env.example to .env.local first.");
    process.exit(1);
  }

  await connectDB();
  console.log("Connected to MongoDB");

  for (const user of DEFAULT_USERS) {
    const result = await User.findOneAndUpdate(
      { slug: user.slug },
      { $setOnInsert: user },
      { upsert: true, new: true },
    );
    console.log(`✓ User: ${result.displayName} (${result.slug})`);
  }

  console.log("\nSeed complete. Update display names in MongoDB or edit scripts/seed.ts.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
