"use client";

import { ReactNode } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}
