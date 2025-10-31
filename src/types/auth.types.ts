// Auth Types and Interfaces

export interface User {
  id: string;
  email: string;
  company?: string;
  name?: string;
  role?: string;
}

export interface LoginCredentials {
  company: string;
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResponse {
  accessToken: string;
  user?: User;
  data?: {
    accessToken: string;
    id?: string;
    name?: string;
    role?: string;
  };
}

export interface RegisterCredentials {
  company: string;
  email: string;
  password: string;
  name?: string;
}
