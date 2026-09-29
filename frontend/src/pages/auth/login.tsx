import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";

import { loginUser } from "@/services/auth";
import { getDashboardPath } from "@/lib/auth";


import type { LoginRequest } from "@/types/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/features/auth/auth-context";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] =
    useState<LoginRequest>({
      email: "",
      password: "",
    });

  const [showPassword, setShowPassword] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    console.log("[LOGIN] Form submitted");

    setError("");

    const email = formData.email.trim();
    const password = formData.password;

    if (!email) {
      setError(
        "Please enter your email address.",
      );
      return;
    }

    if (!password) {
      setError(
        "Please enter your password.",
      );
      return;
    }

    setIsLoading(true);

    console.log(
      "[LOGIN] Sending login request...",
      {
        email,
      },
    );

    try {
      const response = await loginUser({
        email,
        password,
      });

      console.log(
        "[LOGIN] API response:",
        response,
      );

      /*
       * Backend returns:
       *
       * {
       *   user: {...},
       *   token: "..."
       * }
       *
       * We also support accessToken in case
       * the API response is changed later.
       */
      const token =
        response.accessToken ??
        response.token;

      if (!token) {
        throw new Error(
          "Login succeeded, but no authentication token was returned.",
        );
      }

      if (!response.user) {
        throw new Error(
          "Login succeeded, but no user information was returned.",
        );
      }

      console.log(
        "[LOGIN] Authentication successful",
        {
          userId: response.user._id,
          email: response.user.email,
          role: response.user.role,
          isEmailVerified:
            response.user.isEmailVerified,
        },
      );

      /*
       * The backend already requires email
       * verification before issuing a JWT.
       *
       * This frontend check is an additional
       * safety measure.
       */
      if (!response.user.isEmailVerified) {
        navigate(
          `/verify-email?email=${encodeURIComponent(
            response.user.email,
          )}`,
          {
            replace: true,
          },
        );

        return;
      }

      /*
       * IMPORTANT:
       *
       * Use AuthContext.login() instead of
       * saveAuthData().
       *
       * This updates:
       *
       * 1. localStorage
       * 2. AuthContext state
       *
       * ProtectedRoute can therefore immediately
       * recognize the user as authenticated.
       */
      login(
        token,
        response.user,
      );

      console.log(
        "[LOGIN] Auth data saved",
      );

      const dashboardPath =
        getDashboardPath(
          response.user.role,
        );

      console.log(
        "[LOGIN] Redirecting to:",
        dashboardPath,
      );

      navigate(
        dashboardPath,
        {
          replace: true,
        },
      );
    } catch (error: unknown) {
      console.error(
        "[LOGIN] Login failed:",
        error,
      );

      const axiosError = error as {
        response?: {
          data?: {
            message?: string;
            error?: string;
          };
        };
        message?: string;
      };

      const backendMessage =
        axiosError.response?.data
          ?.message ||
        axiosError.response?.data
          ?.error;

      const errorMessage =
        backendMessage ||
        axiosError.message ||
        "Unable to sign in. Please check your email and password.";

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">
            Welcome back
          </CardTitle>

          <CardDescription>
            Sign in to your Freelance Marketplace
            account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {error}
              </div>
            )}

            {/* EMAIL */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email address
              </Label>

              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  autoFocus
                  disabled={isLoading}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">
                  Password
                </Label>

                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  disabled={isLoading}
                  className="pl-10 pr-10"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous,
                    )
                  }
                  disabled={isLoading}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {/* LOGIN BUTTON */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>

            {/* REGISTER LINK */}
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-primary hover:underline"
              >
                Create an account
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}