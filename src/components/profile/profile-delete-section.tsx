"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { profilesApi } from "@/lib/api/client";
import { useAuthUser } from "@/hooks/use-auth-user";

const TAGLINE =
  process.env.NEXT_PUBLIC_DELETE_PROFILE_TAGLINE ??
  "Wrong word. Butcher would not approve.";

export function ProfileDeleteSection() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useAuthUser();
  const [code, setCode] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: () => profilesApi.deleteMe(code.trim()),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["auth"] });
      void queryClient.invalidateQueries({ queryKey: ["profiles"] });
      router.replace("/gate/select-user");
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Could not delete profile");
    },
  });

  if (!session?.user) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    deleteMutation.mutate();
  }

  return (
    <section className="mt-10 space-y-4 rounded-lg border border-primary/40 bg-surface p-6">
      <div>
        <h2 className="text-lg font-semibold text-primary">Delete Profile</h2>
        <p className="text-muted mt-1 text-sm">
          Permanently remove <strong>{session.user.displayName}</strong> and all
          watch history, watchlist, and IMDb ratings for this profile.
        </p>
      </div>

      {!confirmOpen ? (
        <button
          type="button"
          onClick={() => {
            setConfirmOpen(true);
            setError(null);
            setCode("");
          }}
          className="rounded border border-primary/60 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
        >
          Delete this profile…
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-muted text-sm">{TAGLINE}</p>
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Say the magic word"
            autoComplete="off"
            className="h-11 w-full rounded border border-border bg-background px-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {error && (
            <p className="text-primary text-sm" role="alert">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={!code.trim() || deleteMutation.isPending}
              className="rounded bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete forever"}
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmOpen(false);
                setCode("");
                setError(null);
              }}
              disabled={deleteMutation.isPending}
              className="rounded border border-border px-5 py-2.5 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
