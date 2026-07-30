import { NextResponse } from "next/server";
import { isMongoConnectionError } from "@/lib/db/mongodb";
import { jsonError } from "@/lib/api/response";

export const DB_UNAVAILABLE_MESSAGE =
  "Database unavailable. In MongoDB Atlas go to Network Access → Add IP Address → Add Current IP Address, then retry.";

export function handleRouteError(err: unknown): NextResponse {
  if (isMongoConnectionError(err)) {
    return jsonError(DB_UNAVAILABLE_MESSAGE, 503, "DB_UNAVAILABLE");
  }

  if (err instanceof Error && err.message === "MONGODB_URI is not defined") {
    return jsonError("MONGODB_URI is not configured", 503, "DB_NOT_CONFIGURED");
  }

  console.error(err);
  return jsonError("Internal server error", 500, "INTERNAL_ERROR");
}

export async function withErrorHandling(
  fn: () => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    return await fn();
  } catch (err) {
    return handleRouteError(err);
  }
}
