"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authApi } from "@/lib/api/client";

export default function GatePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authApi.verifyCode(code);
      router.push("/gate/select-user");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <p className="text-primary text-sm font-semibold tracking-widest uppercase">
            The Boys Theater
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            You shall not pass
          </h1>
          <p className="text-muted text-sm">
            Unless you know the code. (Inside joke goes here.)
          </p>
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
            {loading ? "Checking…" : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
