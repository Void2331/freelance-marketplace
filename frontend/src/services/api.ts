import axios from "axios";

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL?.replace(/\/$/, "") ??
    "http://localhost:5000/api",

  timeout: 15000,

  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT access token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Handle API responses/errors
api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      const requestUrl = error.config?.url ?? "";

      // Don't redirect if the failed request is itself an auth request.
      const isAuthRequest =
        requestUrl.includes("/auth/login") ||
        requestUrl.includes("/auth/register") ||
        requestUrl.includes("/auth/verify-email") ||
        requestUrl.includes("/auth/resend-verification") ||
        requestUrl.includes("/auth/forgot-password") ||
        requestUrl.includes("/auth/reset-password");

      if (!isAuthRequest) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");

        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);