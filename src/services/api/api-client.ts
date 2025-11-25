import axios, { AxiosHeaders, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { authStorage } from "@/lib/utils";
import { ROUTES } from "@/constants";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost";

class ApiClient {
  private instance: AxiosInstance;

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }


  private setupInterceptors(): void {
    this.instance.interceptors.request.use(
      (config) => {
        const token = authStorage.getToken();
        const tenantId = authStorage.getTenantId();

        const headers =
          config.headers instanceof AxiosHeaders
            ? config.headers
            : new AxiosHeaders(config.headers || {});

        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }

        if (tenantId) {
          headers.set("X-Tenant-ID", tenantId);
        }

        config.headers = headers;
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401 && typeof window !== "undefined") {
          authStorage.clearAuth();
          
          if (!window.location.pathname.startsWith(ROUTES.LOGIN)) {
            const next = encodeURIComponent(
              window.location.pathname + window.location.search
            );
            window.location.href = `${ROUTES.LOGIN}?next=${next}`;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.get<T>(url, config);
  }


  async post<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, data, config);
  }

  async put<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.put<T>(url, data, config);
  }


  async patch<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.patch<T>(url, data, config);
  }


  async delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.delete<T>(url, config);
  }


  getInstance(): AxiosInstance {
    return this.instance;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);


export default apiClient.getInstance();
