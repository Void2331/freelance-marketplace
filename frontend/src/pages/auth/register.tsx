import axios from "axios";
import {
  ArrowRight,
  BriefcaseBusiness,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { registerUser } from "@/services/auth";

type RegistrationRole =
  | "CLIENT"
  | "FREELANCER";

export default function Register() {


  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [role, setRole] =
    useState<RegistrationRole>("FREELANCER");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least one lowercase letter.");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await registerUser({
        name,
        email,
        password,
        role,
      });

      setMessage(
        response.message ??
          "Registration successful. Check your email to verify your account.",
      );
    } catch (err) {
      let errorMessage = "Unable to create your account.";
      if (axios.isAxiosError(err) && err.response?.data) {
        const responseData = err.response.data;
        if (Array.isArray(responseData.errors) && responseData.errors.length > 0) {
          errorMessage = responseData.errors.map((e: { message: string }) => e.message).join(", ");
        } else if (responseData.message) {
          errorMessage = responseData.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-zinc-50">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-lg rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
          <Link
            to="/"
            className="mx-auto flex w-fit items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-950 text-white">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>

            <span className="font-bold">
              FreelanceHub
            </span>
          </Link>

          <div className="mt-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Create your account
            </h1>

            <p className="mt-2 text-sm text-zinc-600">
              Join the marketplace as a client or freelancer.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                {message}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">
                Full name
              </Label>

              <Input
                id="name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Your full name"
                autoComplete="name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-email">
                Email address
              </Label>

              <Input
                id="register-email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-3">
              <Label>
                I want to join as
              </Label>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() =>
                    setRole("FREELANCER")
                  }
                  className={`rounded-xl border p-4 text-left transition ${
                    role === "FREELANCER"
                      ? "border-zinc-950 bg-zinc-950 text-white"
                      : "hover:border-zinc-400"
                  }`}
                >
                  <div className="font-semibold">
                    Freelancer
                  </div>

                  <p
                    className={`mt-1 text-sm ${
                      role === "FREELANCER"
                        ? "text-zinc-300"
                        : "text-zinc-500"
                    }`}
                  >
                    Find projects and grow your freelance
                    career.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setRole("CLIENT")
                  }
                  className={`rounded-xl border p-4 text-left transition ${
                    role === "CLIENT"
                      ? "border-zinc-950 bg-zinc-950 text-white"
                      : "hover:border-zinc-400"
                  }`}
                >
                  <div className="font-semibold">
                    Client
                  </div>

                  <p
                    className={`mt-1 text-sm ${
                      role === "CLIENT"
                        ? "text-zinc-300"
                        : "text-zinc-500"
                    }`}
                  >
                    Post projects and find talented
                    freelancers.
                  </p>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-password">
                Password
              </Label>

              <div className="relative">
                <Input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  className="pr-10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <p className="text-xs text-zinc-500">
                Use at least 8 characters with uppercase,
                lowercase and a number.
              </p>
            </div>

            <Button
              type="submit"
              className="h-11 w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-zinc-950 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}