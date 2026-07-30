import { connectDB, isDBConfigured } from "@/lib/db/mongodb";
import { jsonData } from "@/lib/api/response";

export async function GET() {
  const status: {
    ok: boolean;
    db: "connected" | "disconnected" | "not_configured";
    timestamp: string;
  } = {
    ok: false,
    db: "not_configured",
    timestamp: new Date().toISOString(),
  };

  if (!isDBConfigured()) {
    return jsonData(status);
  }

  try {
    await connectDB();
    status.db = "connected";
    status.ok = true;
  } catch {
    status.db = "disconnected";
  }

  return jsonData(status);
}
