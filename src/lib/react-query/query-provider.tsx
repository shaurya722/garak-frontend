"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { getQueryClient } from "./query-client";

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * React Query Provider Component
 * Wraps the app with QueryClientProvider
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // Use state to ensure we only create the client once per component mount
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
