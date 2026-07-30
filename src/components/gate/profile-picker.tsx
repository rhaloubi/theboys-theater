"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { authApi, profilesApi } from "@/lib/api/client";
import { MAX_PROFILES } from "@/lib/constants/profiles";

export function ProfilePicker() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSwitch = searchParams.get("switch") === "1";
  const queryClient = useQueryClient();

  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authApi.me(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => profilesApi.list(),
    enabled: Boolean(session?.authenticated),
  });

  const createMutation = useMutation({
    mutationFn: (displayName: string) => profilesApi.create(displayName),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profiles"] });
      void queryClient.invalidateQueries({ queryKey: ["auth", "users"] });
      setShowAddModal(false);
      setNewName("");
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Could not create profile");
    },
  });

  useEffect(() => {
    if (sessionLoading) return;
    if (!session?.authenticated) {
      router.replace("/");
    } else if (session.user && !isSwitch) {
      router.replace("/browse");
    }
  }, [session, sessionLoading, router, isSwitch]);

  async function selectUser(slug: string) {
    setLoadingSlug(slug);
    setError(null);
    try {
      await authApi.selectUser(slug);
      void queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      router.push("/browse");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to select profile");
    } finally {
      setLoadingSlug(null);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    createMutation.mutate(newName.trim());
  }

  if (sessionLoading || (!isSwitch && session?.user)) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted text-sm">Loading…</p>
      </div>
    );
  }

  if (!session?.authenticated) return null;

  const users = data?.users ?? [];
  const canAdd = data?.canAddProfile ?? users.length < MAX_PROFILES;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl space-y-8 text-center">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">
            {isSwitch ? "Switch Profile" : "Who's watching?"}
          </h1>
          <p className="text-muted mt-2 text-sm">
            {isSwitch
              ? "Pick a profile — you can switch anytime."
              : "Select your profile to continue."}
          </p>
        </div>

        {isLoading && (
          <p className="text-muted text-sm">Loading profiles…</p>
        )}

        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
          {users.map((user) => (
            <button
              key={user.slug}
              type="button"
              onClick={() => selectUser(user.slug)}
              disabled={Boolean(loadingSlug)}
              className="group flex w-[120px] flex-col items-center gap-3 disabled:opacity-50 sm:w-[140px]"
            >
              <span
                className="flex h-24 w-24 items-center justify-center rounded-md text-3xl font-bold text-white transition-transform duration-300 group-hover:scale-105 sm:h-28 sm:w-28"
                style={{ backgroundColor: user.avatarColor }}
              >
                {user.displayName.charAt(0).toUpperCase()}
              </span>
              <span className="text-muted text-sm transition-colors group-hover:text-foreground">
                {user.displayName}
              </span>
            </button>
          ))}

          {canAdd && (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setShowAddModal(true);
              }}
              disabled={createMutation.isPending}
              className="group flex w-[120px] flex-col items-center gap-3 sm:w-[140px]"
            >
              <span className="flex h-24 w-24 items-center justify-center rounded-md border-2 border-dashed border-muted text-4xl text-muted transition-all duration-300 group-hover:border-foreground group-hover:text-foreground sm:h-28 sm:w-28">
                +
              </span>
              <span className="text-muted text-sm transition-colors group-hover:text-foreground">
                Add Profile
              </span>
            </button>
          )}
        </div>

        {error && (
          <p className="text-primary text-sm" role="alert">
            {error}
          </p>
        )}

        {isSwitch && (
          <button
            type="button"
            onClick={() => router.push("/browse")}
            className="text-muted text-sm hover:text-foreground"
          >
            Cancel
          </button>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-sm space-y-4 rounded-lg border border-border bg-surface p-6 text-left"
          >
            <h2 className="text-xl font-bold">Add Profile</h2>
            <p className="text-muted text-sm">
              {users.length}/{MAX_PROFILES} profiles used
            </p>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Profile name"
              maxLength={20}
              autoFocus
              className="h-11 w-full rounded border border-border bg-background px-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={!newName.trim() || createMutation.isPending}
                className="flex-1 rounded bg-primary py-2.5 font-semibold text-white disabled:opacity-50"
              >
                {createMutation.isPending ? "Creating…" : "Create"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setNewName("");
                }}
                className="flex-1 rounded border border-border py-2.5 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
