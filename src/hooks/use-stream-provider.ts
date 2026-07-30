"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  DEFAULT_STREAM_PROVIDER,
  STREAM_PROVIDER_STORAGE_KEY,
  type StreamProviderId,
  getStreamProvider,
  isStreamProviderId,
} from "@/lib/streaming/providers";

export function useStreamProvider() {
  const searchParams = useSearchParams();
  const providerParam = searchParams.get("provider");

  const [providerId, setProviderIdState] = useState<StreamProviderId>(
    DEFAULT_STREAM_PROVIDER,
  );

  useEffect(() => {
    const fromUrl =
      providerParam && isStreamProviderId(providerParam)
        ? providerParam
        : null;
    const stored = localStorage.getItem(STREAM_PROVIDER_STORAGE_KEY);
    const fromStorage =
      stored && isStreamProviderId(stored) ? stored : DEFAULT_STREAM_PROVIDER;

    setProviderIdState(fromUrl ?? fromStorage);
    if (fromUrl) {
      localStorage.setItem(STREAM_PROVIDER_STORAGE_KEY, fromUrl);
    }
  }, [providerParam]);

  function setProviderId(id: StreamProviderId) {
    setProviderIdState(id);
    localStorage.setItem(STREAM_PROVIDER_STORAGE_KEY, id);
  }

  return {
    providerId,
    setProviderId,
    provider: getStreamProvider(providerId),
  };
}
