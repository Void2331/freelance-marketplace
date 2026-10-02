import type { AuthUser } from "@/types/auth";

export function getStoredUser(): AuthUser | null {
  try {
    const storedUser =
      localStorage.getItem("user");

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