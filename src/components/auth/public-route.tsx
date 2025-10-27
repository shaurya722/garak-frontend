"use client";

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface PublicRouteProps {
  children: ReactNode;
  redirectIfAuthenticated?: boolean;
  redirectTo?: string;
  fallback?: ReactNode;
}

export function PublicRoute({ 
  children, 
  redirectIfAuthenticated = false,
  redirectTo = '/',
  fallback
}: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && redirectIfAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectIfAuthenticated, router, redirectTo]);

  // Show loading state
  if (isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (isAuthenticated && redirectIfAuthenticated) {
    return null;
  }

  // Render children
  return <>{children}</>;
}

// Higher-order component version for public routes
export function withPublicRoute<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<PublicRouteProps, 'children'>
) {
  return function PublicComponent(props: P) {
    return (
      <PublicRoute {...options}>
        <Component {...props} />
      </PublicRoute>
    );
  };
}
