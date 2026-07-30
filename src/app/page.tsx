"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/api/client";

const TAGLINE =
  process.env.NEXT_PUBLIC_GATE_TAGLINE ??
  "Homelander can't hear you in here. What's the password?";

export default function GatePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authApi.me(),
  });

  useEffect(() => {
    if (sessionLoading) return;
    if (session?.user) {
      router.replace("/browse");
    } else if (session?.authenticated && session.needsUserSelection) {
      router.replace("/gate/select-user");
    }
  }, [session, sessionLoading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authApi.verifyCode(code);
      router.push("/gate/select-user");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setShake(true);
      setTimeout(() => setShake(false), 200);
    } finally {
      setLoading(false);
    }
  }

  if (sessionLoading || session?.authenticated) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4">
      <div
        className={`w-full max-w-md space-y-8 text-center ${shake ? "animate-shake" : ""}`}
      >
        <div className="space-y-2">
          <p className="text-primary text-sm font-semibold tracking-widest uppercase">
            The Boys Theater
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            You shall not pass
          </h1>
          <p className="text-muted text-sm">{TAGLINE}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Secret code"
            autoComplete="off"
            className="h-12 w-full rounded border border-border bg-surface px-4 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
          {error && (
            <p className="text-primary text-sm" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="h-12 w-full rounded bg-primary font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Checking…" : "Enter the Seven"}
          </button>
        </form>
      </div>
    </div>
  );
}
