// components/auth/protected-route.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  publicRoutes?: string[];
  loadingComponent?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  redirectTo = '/login',
  publicRoutes = ['/login', '/register', '/forgot-password'],
  loadingComponent
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect if still loading or if it's a public route
    if (isLoading || publicRoutes.includes(pathname)) {
      return;
    }

    // If not authenticated and not on a public route, redirect to login
    if (!isAuthenticated) {
      const searchParams = new URLSearchParams();
      searchParams.set('next', pathname);
      router.replace(`${redirectTo}?${searchParams.toString()}`);
    }
  }, [isAuthenticated, isLoading, pathname, publicRoutes, redirectTo, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return loadingComponent || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // If it's a public route or user is authenticated, render children
  if (publicRoutes.includes(pathname) || isAuthenticated) {
    return <>{children}</>;
  }

  // If we get here, we're in a loading state (shouldn't happen due to the redirect)
  return null;
}