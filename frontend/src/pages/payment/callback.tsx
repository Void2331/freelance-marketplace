import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { verifyPayment } from "@/services/payment";
import { getMilestone } from "@/services/milestone";
import { getErrorMessage } from "@/lib/errors";

type Phase = "verifying" | "waiting" | "success" | "failed";

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 10;

/**
 * Landing page Paystack redirects to after checkout (?reference=...).
 *
 * 1. Asks the backend to verify the transaction with Paystack.
 * 2. Funding itself is applied by the Paystack webhook, so we then poll the
 *    milestone until it flips out of PENDING before sending the user on.
 */
export default function PaymentCallback() {
  const [searchParams] = useSearchParams();

  const reference =
    searchParams.get("reference") ?? searchParams.get("trxref");

  // A missing reference is known up front, so start in the failed state
  // rather than setting it from inside the effect.
  const [phase, setPhase] = useState<Phase>(reference ? "verifying" : "failed");
  const [message, setMessage] = useState(
    reference ? "" : "No payment reference was provided.",
  );
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) return;

    let cancelled = false;

    async function run(ref: string) {
      try {
        const result = await verifyPayment(ref);

        if (cancelled) return;

        if (result.transaction.status !== "success") {
          setPhase("failed");
          setMessage("The payment was not completed.");
          return;
        }

        const payment = result.payment as typeof result.payment & {
          milestone?: string;
          project?: string;
        };

        if (payment.project) setProjectId(payment.project);

        setPhase("waiting");

        // Without a milestone id there is nothing to poll for.
        if (!payment.milestone) {
          setPhase("success");
          return;
        }

        for (let attempt = 0; attempt < MAX_POLLS; attempt += 1) {
          const milestone = await getMilestone(payment.milestone);

          if (cancelled) return;

          const pid =
            typeof milestone.project === "string"
              ? milestone.project
              : (milestone.project as { _id: string })._id;

          setProjectId(pid);

          if (milestone.status !== "PENDING") {
            setPhase("success");
            return;
          }

          await new Promise((resolve) =>
            setTimeout(resolve, POLL_INTERVAL_MS),
          );
        }

        // Verified but the webhook hasn't landed yet.
        if (!cancelled) setPhase("success");
      } catch (error) {
        if (cancelled) return;
        setPhase("failed");
        setMessage(
          getErrorMessage(error, "We couldn't verify this payment."),
        );
      }
    }

    run(reference);

    return () => {
      cancelled = true;
    };
  }, [reference]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {(phase === "verifying" || phase === "waiting") && (
          <>
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-zinc-400" />
            <h1 className="mt-4 text-2xl font-semibold">
              {phase === "verifying"
                ? "Verifying your payment..."
                : "Confirming your payment..."}
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Please don't close this page.
            </p>
          </>
        )}

        {phase === "success" && (
          <>
            <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
            <h1 className="mt-4 text-2xl font-semibold">Payment received</h1>
            <p className="mt-2 text-sm text-zinc-500">
              Your milestone is being funded and held in escrow. If it still
              shows as pending, give it a moment and refresh the project.
            </p>
            <Button asChild className="mt-6">
              <Link to={projectId ? `/projects/${projectId}` : "/dashboard"}>
                {projectId ? "Back to project" : "Go to dashboard"}
              </Link>
            </Button>
          </>
        )}

        {phase === "failed" && (
          <>
            <XCircle className="mx-auto h-10 w-10 text-red-600" />
            <h1 className="mt-4 text-2xl font-semibold">Payment problem</h1>
            <p className="mt-2 text-sm text-zinc-500">{message}</p>
            <Button asChild variant="outline" className="mt-6">
              <Link to="/dashboard">Go to dashboard</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
