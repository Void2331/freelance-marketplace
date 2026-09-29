import { Navigate } from "react-router-dom";

import { useAuth } from "@/features/auth/auth-context";
import { getDashboardPath } from "@/features/auth/auth-utils";

export default function DashboardRedirect() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return (
    <Navigate
      to={getDashboardPath(user.role)}
      replace
    />
  );
}