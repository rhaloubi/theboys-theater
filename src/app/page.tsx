"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api/client";
import { TbtMark } from "@/components/brand/tbt-logo";

const TAGLINE =
  process.env.NEXT_PUBLIC_GATE_TAGLINE ??
  "Homelander can't hear you in here. What's the password?";

function GateBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <Image
        src="/movies.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="scale-105 object-cover blur-[4px]"
      />
      <div className="absolute inset-0 bg-black/60" />
    </div>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden
      >
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

function GateShell({
  children,
  shake = false,
}: {
  children: React.ReactNode;
  shake?: boolean;
}) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center px-4 py-12">
      <GateBackdrop />
      <div
        className={`relative z-10 w-full max-w-md space-y-8 text-center ${shake ? "animate-shake" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}

export default function GatePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      router.refresh();
      router.replace("/gate/select-user");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setShake(true);
      setTimeout(() => setShake(false), 200);
      setLoading(false);
    }
  }

  const redirecting =
    !sessionLoading && Boolean(session?.authenticated) && !session?.user;

  if (sessionLoading || session?.user || redirecting) {
    return (
      <GateShell>
        <p className="text-muted text-sm drop-shadow-sm">Loading…</p>
      </GateShell>
    );
  }

  return (
    <GateShell shake={shake}>
      <div className="flex flex-col items-center space-y-2">
        <TbtMark size="lg" className="shadow-lg ring-white/20" />
        <h1 className="text-3xl font-bold tracking-tight drop-shadow-md sm:text-4xl">
          You shall not pass
        </h1>
        <p className="text-sm text-white/85 drop-shadow-sm">{TAGLINE}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Secret code"
            autoComplete="off"
            className="h-12 w-full rounded border border-white/20 bg-black/50 px-4 pr-12 text-foreground backdrop-blur-sm outline-none placeholder:text-white/50 focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="text-muted absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 transition-colors hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>
        {error && (
          <p className="text-primary text-sm drop-shadow-sm" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="h-12 w-full rounded bg-primary font-semibold text-white shadow-lg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Checking…" : "Enter the Seven"}
        </button>
      </form>
    </GateShell>
  );
}
