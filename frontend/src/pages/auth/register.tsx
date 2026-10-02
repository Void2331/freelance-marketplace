import {
  ArrowRight,
  BriefcaseBusiness,
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

      setMessage(
  response.message ??
    "Registration successful. Check your email to verify your account.",
);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to create your account.";

      setError(message);
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

              <Input
                id="register-password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="At least 8 characters"
                autoComplete="new-password"
                minLength={8}
                required
              />

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