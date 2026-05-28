"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { FavoritesProvider } from "@/src/context/favorites-context";
import { getQueryClient } from "@/src/lib/query-client";

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(getQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <FavoritesProvider>{children}</FavoritesProvider>
    </QueryClientProvider>
  );
}
