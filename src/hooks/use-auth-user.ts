"use client";

import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/api/client";

export function useAuthUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authApi.me(),
    staleTime: 30_000,
  });
}
