/**
 * Generate GATE_CODE_HASH for .env
 * Usage: npx tsx scripts/hash-gate-code.ts your-secret-code
 */
import { createHash } from "crypto";

const code = process.argv[2];
const secret = process.argv[3] ?? "change-me-to-a-long-random-string";

if (!code) {
  console.error("Usage: npx tsx scripts/hash-gate-code.ts <code> [session-secret]");
  process.exit(1);
}

const hash = createHash("sha256").update(`${code}:${secret}`).digest("hex");
console.log("\nAdd to .env.local:\n");
console.log(`GATE_CODE_HASH=${hash}`);
console.log(`SESSION_SECRET=${secret}`);
console.log("\nRemove GATE_CODE when using GATE_CODE_HASH in production.\n");
