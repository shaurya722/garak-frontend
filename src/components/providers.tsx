"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/auth-context";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
          <Toaster richColors closeButton expand={false} />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
