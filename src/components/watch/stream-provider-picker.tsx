"use client";

import {
  STREAM_PROVIDERS,
  type StreamProviderId,
} from "@/lib/streaming/providers";

interface StreamProviderPickerProps {
  value: StreamProviderId;
  onChange: (id: StreamProviderId) => void;
}

export function StreamProviderPicker({
  value,
  onChange,
}: StreamProviderPickerProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-muted text-sm">Source</span>
      <div className="flex flex-wrap gap-2">
        {STREAM_PROVIDERS.map((provider) => (
          <button
            key={provider.id}
            type="button"
            onClick={() => onChange(provider.id)}
            className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
              value === provider.id
                ? "bg-primary font-medium text-white"
                : "bg-surface text-muted hover:bg-surface-elevated hover:text-foreground"
            }`}
          >
            {provider.label}
          </button>
        ))}
      </div>
    </div>
  );
}
