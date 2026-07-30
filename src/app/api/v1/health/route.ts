import { connectDB, isDBConfigured } from "@/lib/db/mongodb";
import { DB_UNAVAILABLE_MESSAGE } from "@/lib/api/route-handler";
import { jsonData } from "@/lib/api/response";

export async function GET() {
  const status: {
    ok: boolean;
    db: "connected" | "disconnected" | "not_configured";
    message?: string;
    timestamp: string;
  } = {
    ok: false,
    db: "not_configured",
    timestamp: new Date().toISOString(),
  };

  if (!isDBConfigured()) {
    status.message = "MONGODB_URI is not set";
    return jsonData(status);
  }

  try {
    await connectDB();
    status.db = "connected";
    status.ok = true;
  } catch {
    status.db = "disconnected";
    status.message = DB_UNAVAILABLE_MESSAGE;
  }

  return jsonData(status);
}
