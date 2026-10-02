import { useState } from "react";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forgotPassword } from "@/services/auth";
import { getErrorMessage } from "@/lib/errors";

const schema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      await forgotPassword(values.email);
      setSent(true);
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Unable to send reset email"),
      );
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight">
          Forgot your password?
        </h1>

        {sent ? (
          <p className="mt-3 text-sm text-zinc-600">
            If an account exists for that email, a reset link is on its way.
            Check your inbox.
          </p>
        ) : (
          <>
            <p className="mt-2 text-sm text-zinc-500">
              Enter your email and we'll send you a reset link.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Send reset link
              </Button>
            </form>
          </>
        )}

        <Link
          to="/login"
          className="mt-6 block text-center text-sm text-zinc-500 hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
