import type { AuthUser } from "@/types/auth";

export function getStoredUser(): AuthUser | null {
  try {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser) as AuthUser;
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem("accessToken");
}

export function saveAuthData(
  token: string,
  user: AuthUser,
): void {
  localStorage.setItem("accessToken", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearAuthData(): void {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
}

export function getDashboardPath(
  role: AuthUser["role"],
): string {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";

    case "CLIENT":
      return "/client/dashboard";

    case "FREELANCER":
      return "/freelancer/dashboard";

    default:
      return "/";
  }
}