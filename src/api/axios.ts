import axios, { AxiosHeaders } from "axios";

export const api = axios.create({
  baseURL: "",
});

function getTokenFromLocalStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const token = window.localStorage.getItem("token");
    return token && token.trim() !== "" ? token : null;
  } catch {
    return null;
  }
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

api.interceptors.request.use((config) => {
  const token = getTokenFromLocalStorage();
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

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.startsWith("/login")) {
        const next = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/login?next=${next}`;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
