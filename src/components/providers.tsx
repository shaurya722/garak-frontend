"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/lib/react-query";
import { AuthProvider } from "@/contexts/auth-context";
import { ErrorBoundary } from "@/components/shared";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster richColors closeButton expand={false} />
          </AuthProvider>
        </QueryProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
