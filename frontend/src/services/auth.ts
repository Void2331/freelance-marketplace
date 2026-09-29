import { api } from "./api";

import type {
  ApiAuthResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "@/types/auth";

export const registerUser = async (
  data: RegisterRequest,
): Promise<AuthResponse> => {
  const response = await api.post<ApiAuthResponse>(
    "/auth/register",
    data,
  );

  return response.data.data;
};

export const loginUser = async (
  data: LoginRequest,
): Promise<AuthResponse> => {
  const response = await api.post<ApiAuthResponse>(
    "/auth/login",
    data,
  );

  return response.data.data;
};

export const verifyEmail = async (
  token: string,
): Promise<ApiAuthResponse> => {
  const response = await api.get<ApiAuthResponse>(
    "/auth/verify-email",
    {
      params: {
        token,
      },
    },
  );

  return response.data;
};

export const resendVerificationEmail = async (
  email: string,
): Promise<ApiAuthResponse> => {
  const response = await api.post<ApiAuthResponse>(
    "/auth/resend-verification",
    {
      email,
    },
  );

  return response.data;
};

export const forgotPassword = async (
  email: string,
): Promise<ApiAuthResponse> => {
  const response = await api.post<ApiAuthResponse>(
    "/auth/forgot-password",
    {
      email,
    },
  );

  return response.data;
};

export const resetPassword = async (
  token: string,
  password: string,
): Promise<ApiAuthResponse> => {
  const response = await api.post<ApiAuthResponse>(
    "/auth/reset-password",
    {
      token,
      password,
    },
  );

  return response.data;
};