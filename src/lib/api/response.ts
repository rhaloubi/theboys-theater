import { NextResponse } from "next/server";
import type { ApiErrorBody } from "@/lib/types";

export function jsonData<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, init);
}

export function jsonError(
  message: string,
  status = 400,
  code?: string,
): NextResponse {
  const body: ApiErrorBody = { error: message, code };
  return NextResponse.json(body, { status });
}

export function notImplemented(feature: string): NextResponse {
  return jsonError(`${feature} is not implemented yet`, 501, "NOT_IMPLEMENTED");
}

export async function parseJsonBody<T>(
  request: Request,
): Promise<T | NextResponse> {
  try {
    return (await request.json()) as T;
  } catch {
    return jsonError("Invalid JSON body", 400, "INVALID_JSON");
  }
}
