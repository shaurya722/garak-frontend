import { apiClient } from "./api-client";
import { apiConfig } from "@/config/api";
import { 
  LoginCredentials, 
  LoginResponse, 
  RegisterCredentials,
  User,
} from "@/types";
import { handleApiError, authStorage } from "@/lib/utils";

export const authService = {

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

      authStorage.setToken(accessToken);

      return data;
    } catch (error) {
      return handleApiError(error, "Login");
    }
  },


  async register(credentials: RegisterCredentials): Promise<User> {
    try {
      const response = await apiClient.post<{ data: User } | User>(
        apiConfig.endpoints.authCompanyRegister,
        credentials
      );

      // Handle both response formats: { data: User } or direct User
      const responseData = response.data;
      if (responseData && typeof responseData === 'object' && 'data' in responseData) {
        return responseData.data as User;
      }
      return responseData as User;
    } catch (error) {
      return handleApiError(error, "Register");
    }
  },


  logout(): void {
    authStorage.clearAuth();
  },


  isAuthenticated(): boolean {
    return !!authStorage.getToken();
  },


  getCurrentUser(): User | null {
    return null;
  },
};
