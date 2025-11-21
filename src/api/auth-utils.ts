
export function isAuthenticated(): boolean {
  if (typeof document === 'undefined') return false;
  
  const match = document.cookie.match(/(?:^|; )token=([^;]*)/);
  return !!match && match[1] !== '';
}

export function getAuthToken(): string | null {
  if (typeof document === 'undefined') return null;
  
  const match = document.cookie.match(/(?:^|; )token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function clearAuthToken(): void {
  if (typeof document === 'undefined') return;
  
  document.cookie = 'token=; Path=/; Max-Age=0; SameSite=Lax';
}

export function setAuthToken(token: string, rememberMe: boolean = false): void {
  if (typeof document === 'undefined') return;
  
  const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7; // 30 days or 7 days
  document.cookie = `token=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

export function redirectToLogin(returnUrl?: string): void {
  if (typeof window === 'undefined') return;
  
  const url = returnUrl 
    ? `/login?next=${encodeURIComponent(returnUrl)}` 
    : '/login';
  
  window.location.href = url;
}

export function redirectToDashboard(): void {
  if (typeof window === 'undefined') return;
  
  window.location.href = '/';
}
