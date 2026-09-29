import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  resendVerificationEmail,
  verifyEmail,
} from "@/services/auth";
import { getErrorMessage } from "@/lib/errors";

type Status = "loading" | "success" | "error" | "pending";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<Status>(
    token ? "loading" : "pending",
  );

  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);

  /*
   * Prevent the same verification token from being
   * submitted multiple times.
   *
   * This is especially important when React StrictMode
   * runs effects more than once during development.
   */
  const verificationStarted = useRef(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    if (verificationStarted.current) {
      return;
    }

    verificationStarted.current = true;

    const verify = async () => {
      try {
        const response = await verifyEmail(token);

        setStatus("success");

        setMessage(
          response.message ??
            "Your email has been verified. You can now sign in.",
        );

        toast.success("Email verified successfully");
      } catch (error: unknown) {
        setStatus("error");

        setMessage(
          getErrorMessage(
            error,
            "This verification link is invalid or has expired.",
          ),
        );
      }
    };

    verify();
  }, [token]);

  async function handleResend() {
    if (!email) {
      return;
    }

    setResending(true);

    try {
      await resendVerificationEmail(email);

      setStatus("pending");

      setMessage(
        "A new verification link has been sent to your email address.",
      );

      toast.success("Verification email sent");
    } catch (error: unknown) {
      toast.error(
        getErrorMessage(
          error,
          "Unable to resend verification email.",
        ),
      );
    } finally {
      setResending(false);
    }
  }

  /*
   * No token means the user has simply been sent to
   * the verification page and needs to check their inbox.
   */
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl font-semibold">
            Check your inbox
          </h1>

          <p className="mt-3 text-muted-foreground">
            {email
              ? `We sent a verification link to ${email}. Click the link in your email to verify your account.`
              : "Open the verification link we sent to your email address to verify your account."}
          </p>

          {email && (
            <Button
              variant="outline"
              className="mt-6"
              onClick={handleResend}
              disabled={resending}
            >
              {resending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}

              Resend verification email
            </Button>
          )}

          <div>
            <Button
              asChild
              variant="ghost"
              className="mt-2"
            >
              <Link to="/login">
                Back to sign in
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-md text-center">
        {/* Loading */}
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto size-8 animate-spin text-muted-foreground" />

            <h1 className="mt-5 text-2xl font-semibold">
              Verifying your email...
            </h1>

            <p className="mt-3 text-muted-foreground">
              Please wait while we verify your email address.
            </p>
          </>
        )}

        {/* Success */}
        {status === "success" && (
          <>
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-green-100">
              <span className="text-2xl font-bold text-green-600">
                ✓
              </span>
            </div>

            <h1 className="mt-5 text-2xl font-semibold text-green-600">
              Email verified
            </h1>

            <p className="mt-3 text-muted-foreground">
              {message}
            </p>

            <Button asChild className="mt-6">
              <Link to="/login">
                Continue to sign in
              </Link>
            </Button>
          </>
        )}

        {/* Error */}
        {status === "error" && (
          <>
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-100">
              <span className="text-2xl font-bold text-red-600">
                !
              </span>
            </div>

            <h1 className="mt-5 text-2xl font-semibold text-red-600">
              Verification failed
            </h1>

            <p className="mt-3 text-muted-foreground">
              {message}
            </p>

            {email && (
              <Button
                variant="outline"
                className="mt-6"
                onClick={handleResend}
                disabled={resending}
              >
                {resending && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}

                Resend verification email
              </Button>
            )}

            <div>
              <Button
                asChild
                variant="ghost"
                className="mt-2"
              >
                <Link to="/login">
                  Back to sign in
                </Link>
              </Button>
            </div>
          </>
        )}

        {/* Pending */}
        {status === "pending" && (
          <>
            <h1 className="text-2xl font-semibold">
              Check your inbox
            </h1>

            <p className="mt-3 text-muted-foreground">
              {email
                ? `We sent a verification link to ${email}. Click it to activate your account.`
                : "Open the verification link we emailed you to activate your account."}
            </p>

            {email && (
              <Button
                variant="outline"
                className="mt-6"
                onClick={handleResend}
                disabled={resending}
              >
                {resending && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}

                Resend verification email
              </Button>
            )}

            <div>
              <Button
                asChild
                variant="ghost"
                className="mt-2"
              >
                <Link to="/login">
                  Back to sign in
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}