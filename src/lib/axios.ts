import axios, { AxiosHeaders } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
});

function getTokenFromCookies(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function getTenantIdFromLocalStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem("tenant_id");
    return value && value.trim() !== "" ? value : null;
  } catch {
    return null;
  }
}

// Attach Authorization and X-Tenant-ID headers if present
api.interceptors.request.use((config) => {
  const token = getTokenFromCookies();
  const tenantId = getTenantIdFromLocalStorage();

  const headers =
    config.headers instanceof AxiosHeaders
      ? config.headers
      : new AxiosHeaders(config.headers || {});

  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (tenantId) headers.set("X-Tenant-ID", tenantId);

  config.headers = headers;
  return config;
});

// Basic 401 handler
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      // Clear token cookie
      document.cookie = `token=; Max-Age=0; path=/`;
      if (!window.location.pathname.startsWith("/login")) {
        const next = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/login?next=${next}`;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
