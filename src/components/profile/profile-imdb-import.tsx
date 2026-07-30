"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { imdbApi } from "@/lib/api/client";
import type { ImdbImportResult } from "@/lib/types";

export function ProfileImdbImport() {
  const queryClient = useQueryClient();
  const [result, setResult] = useState<ImdbImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (file: File) => imdbApi.importCsv(file),
    onSuccess: (data) => {
      setResult(data);
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ["imdb"] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Import failed");
      setResult(null);
    },
  });

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) mutation.mutate(file);
    e.target.value = "";
  }

  return (
    <section className="space-y-4 rounded-lg border border-border bg-surface p-6">
      <div>
        <h2 className="text-lg font-semibold">Import IMDb Ratings</h2>
        <p className="text-muted mt-1 text-sm">
          Export from IMDb: Settings → Your ratings → Export (.csv). Upload
          here to compare scores with your friend.
        </p>
      </div>

      <label className="inline-flex cursor-pointer items-center justify-center rounded bg-primary px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90">
        {mutation.isPending ? "Importing…" : "Choose CSV file"}
        <input
          type="file"
          accept=".csv"
          className="hidden"
          disabled={mutation.isPending}
          onChange={handleFile}
        />
      </label>

      {error && (
        <p className="text-primary text-sm" role="alert">
          {error}
        </p>
      )}

      {result && (
        <div className="text-sm">
          <p className="text-success">
            Imported {result.imported} ratings
            {result.unmapped > 0 &&
              ` · ${result.unmapped} could not map to TMDB`}
          </p>
          {result.unmappedTitles.length > 0 && (
            <p className="text-muted mt-2">
              Unmapped: {result.unmappedTitles.join(", ")}
              {result.unmapped > result.unmappedTitles.length ? "…" : ""}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
