"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authApi } from "@/lib/api/client";

export default function SelectUserPage() {
  const router = useRouter();
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authApi.me(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["auth", "users"],
    queryFn: () => authApi.listUsers(),
    enabled: Boolean(session?.authenticated),
  });

  useEffect(() => {
    if (sessionLoading) return;
    if (!session?.authenticated) {
      router.replace("/");
    } else if (session.user) {
      router.replace("/browse");
    }
  }, [session, sessionLoading, router]);

  async function selectUser(slug: string) {
    setLoadingSlug(slug);
    setError(null);
    try {
      await authApi.selectUser(slug);
      router.push("/browse");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to select user");
    } finally {
      setLoadingSlug(null);
    }
  }

  if (sessionLoading || !session?.authenticated || session.user) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-2xl font-bold">Who&apos;s watching?</h1>
        <p className="text-muted text-sm">Pick your profile to continue.</p>

        {isLoading && <p className="text-muted text-sm">Loading profiles…</p>}

        <div className="grid grid-cols-2 gap-4">
          {data?.users.map((user) => (
            <button
              key={user.slug}
              type="button"
              onClick={() => selectUser(user.slug)}
              disabled={Boolean(loadingSlug)}
              className="flex flex-col items-center gap-3 rounded-lg bg-surface p-6 transition-colors hover:bg-surface-elevated disabled:opacity-50"
            >
              <span
                className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white"
                style={{ backgroundColor: user.avatarColor }}
              >
                {user.displayName.charAt(0).toUpperCase()}
              </span>
              <span className="font-medium">{user.displayName}</span>
            </button>
          ))}
        </div>

        {error && (
          <p className="text-primary text-sm" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
