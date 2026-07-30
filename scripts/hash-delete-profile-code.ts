/**
 * Generate DELETE_PROFILE_CODE_HASH for .env
 * Usage: npx tsx scripts/hash-delete-profile-code.ts your-secret-code
 */
import { config } from "dotenv";
import { createHash } from "crypto";

config({ path: ".env.local" });
config({ path: ".env" });

const code = process.argv[2];
if (!code) {
  console.error("Usage: npx tsx scripts/hash-delete-profile-code.ts <code>");
  process.exit(1);
}

const secret = process.env.SESSION_SECRET ?? "dev-secret";
const hash = createHash("sha256")
  .update(`delete-profile:${code}:${secret}`)
  .digest("hex");

console.log(`DELETE_PROFILE_CODE_HASH=${hash}`);
console.log("\nRemove DELETE_PROFILE_CODE when using DELETE_PROFILE_CODE_HASH.\n");
