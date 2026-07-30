import { z } from "zod";
import {
  createSession,
  sessionCookieOptions,
  verifyGateCode,
} from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/route-handler";
import { jsonData, jsonError, parseJsonBody } from "@/lib/api/response";

const verifyCodeSchema = z.object({
  code: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await parseJsonBody<unknown>(request);
  if (body instanceof Response) return body;

  return withErrorHandling(async () => {
    const parsed = verifyCodeSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Code is required", 400, "VALIDATION_ERROR");
    }

    if (!verifyGateCode(parsed.data.code)) {
      return jsonError("Wrong code. Nice try.", 401, "INVALID_CODE");
    }

    const token = await createSession();

    const response = jsonData({ success: true, needsUserSelection: true });
    response.cookies.set(sessionCookieOptions(token));
    return response;
  });
}
