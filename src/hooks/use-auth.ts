import { useAuth } from '@/contexts/auth-context';

export { useAuth } from '@/contexts/auth-context';

export function useRequireAuth() {
  const auth = useAuth();
  
  if (!auth.isAuthenticated && !auth.isLoading) {
    throw new Error('Authentication required');
  }
  
  return auth;
}

export function useAuthRedirect() {
  const auth = useAuth();
  
  return {
    redirectToLogin: (returnUrl?: string) => {
      const url = returnUrl ? `/login?next=${encodeURIComponent(returnUrl)}` : '/login';
      window.location.href = url;
    },
    redirectToDashboard: () => {
      window.location.href = '/';
    }
  };
}
