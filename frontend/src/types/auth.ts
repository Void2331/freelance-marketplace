export type UserRole =
  | "ADMIN"
  | "CLIENT"
  | "FREELANCER";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  avatar?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: "CLIENT" | "FREELANCER";
}

export interface AuthResponse {
  accessToken?: string;
  token?: string;
  user: AuthUser;
}

export interface ApiAuthResponse {
  success: boolean;
  message: string;
  data: AuthResponse;
}