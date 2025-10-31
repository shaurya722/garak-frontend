import { apiClient } from "./api-client";
import { apiConfig } from "@/config/api";
import { 
  LoginCredentials, 
  LoginResponse, 
  RegisterCredentials,
  User,
} from "@/types";
import { handleApiError, authStorage } from "@/lib/utils";

/**
 * Auth Service
 * All API calls related to authentication
 */
export const authService = {
  /**
   * Login with company credentials
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(
        apiConfig.endpoints.authCompanyLogin,
        {
          company: credentials.company,
          email: credentials.email,
          password: credentials.password,
          rememberMe: credentials.rememberMe,
        }
      );

      const data = response.data;
      const accessToken = data.data?.accessToken || data.accessToken;

      if (!accessToken) {
        throw new Error("No access token received");
      }

      // Store token
      authStorage.setToken(accessToken);

      return data;
    } catch (error) {
      return handleApiError(error, "Login");
    }
  },

  /**
   * Register a new company account
   */
  async register(credentials: RegisterCredentials): Promise<User> {
    try {
      const response = await apiClient.post<{ data: User }>(
        apiConfig.endpoints.authCompanyRegister,
        credentials
      );

      return response.data.data || response.data;
    } catch (error) {
      return handleApiError(error, "Register");
    }
  },

  /**
   * Logout - clear local storage
   */
  logout(): void {
    authStorage.clearAuth();
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!authStorage.getToken();
  },

  /**
   * Get current user (if stored locally)
   */
  getCurrentUser(): User | null {
    // You can implement this if user data is stored in localStorage
    // For now, return null
    return null;
  },
};
