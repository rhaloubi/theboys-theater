import type { ApiErrorBody, AuthMeResponse } from "@/lib/types";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/v1${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = (await res.json()) as ApiErrorBody;
      message = body.error ?? message;
    } catch {
      // ignore
    }
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}

export const authApi = {
  verifyCode: (code: string) =>
    api<{ success: boolean; needsUserSelection: boolean }>("/auth/verify-code", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),
  selectUser: (userSlug: string) =>
    api<{ user: AuthMeResponse["user"] }>("/auth/select-user", {
      method: "POST",
      body: JSON.stringify({ userSlug }),
    }),
  me: () => api<AuthMeResponse>("/auth/me"),
  logout: () => api<{ success: boolean }>("/auth/logout", { method: "POST" }),
  listUsers: () =>
    api<{
      users: Array<{
        slug: string;
        displayName: string;
        avatarColor: string;
      }>;
    }>("/auth/select-user"),
};

export const healthApi = {
  check: () =>
    api<{ ok: boolean; db: string; timestamp: string }>("/health"),
};
