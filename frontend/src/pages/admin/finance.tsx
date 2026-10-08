import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatusBadge } from "@/components/dashboard/status-badge";

import {
  useAdminPayments,
  useAdminWithdrawals,
  useRetryRefund,
} from "@/hooks/use-admin";
import { formatMoney } from "@/lib/format";
import { getErrorMessage } from "@/lib/errors";

import type { AdminPayment } from "@/types/admin";

type Tab = "payments" | "withdrawals";

const PAYMENT_FILTERS = [
  { value: "REFUND_PENDING", label: "Refunds waiting" },
  { value: "", label: "All payments" },
  { value: "FUNDED", label: "Held in escrow" },
  { value: "RELEASED", label: "Released" },
  { value: "REFUNDED", label: "Refunded" },
  { value: "FAILED", label: "Failed" },
];

const WITHDRAWAL_FILTERS = [
  { value: "", label: "All withdrawals" },
  { value: "PROCESSING", label: "Processing" },
  { value: "PENDING", label: "Pending" },
  { value: "SUCCESS", label: "Paid out" },
  { value: "FAILED", label: "Failed" },
  { value: "REVERSED", label: "Reversed" },
];

function FilterChips({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {options.map((option) => (
        <Button
          key={option.label}
          size="sm"
          variant={value === option.value ? "default" : "outline"}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

function RetryRefundButton({ payment }: { payment: AdminPayment }) {
  const retry = useRetryRefund();

  async function handleRetry() {
    const amount = payment.refundAmount
      ? formatMoney(payment.refundAmount, payment.currency)
      : "the recorded amount";

    const confirmed = window.confirm(
      `Ask Paystack to refund ${amount} to the client?\n\nPaystack is checked first, so a refund that already exists will not be duplicated.`,
    );

    if (!confirmed) return;

    try {
      const result = await retry.mutateAsync(payment._id);
      toast.success(result.message);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to retry the refund"));
    }
  }

  return (
    <div className="space-y-1">
      <Button size="sm" onClick={handleRetry} disabled={retry.isPending}>
        {retry.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Retry refund
      </Button>

      {payment.lastRefundRetry && (
        <p className="text-xs text-zinc-500">
          Last try {new Date(payment.lastRefundRetry.at).toLocaleString()}:{" "}
          {payment.lastRefundRetry.outcome.replaceAll("_", " ").toLowerCase()}
        </p>
      )}
    </div>
  );
}

function PaymentsTab() {
  const [status, setStatus] = useState("REFUND_PENDING");
  const { data: payments = [], isLoading, isError } = useAdminPayments(
    status || undefined,
  );

  return (
    <>
      <FilterChips options={PAYMENT_FILTERS} value={status} onChange={setStatus} />

      {status === "REFUND_PENDING" && payments.length > 0 && (
        <p className="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          These clients won a dispute but their refund has not completed at
          Paystack yet. A refund usually clears on its own once Paystack
          confirms it; use Retry only if it has been stuck for a while.
        </p>
      )}

      {isLoading ? (
        <div className="h-32 animate-pulse rounded-xl bg-zinc-100" />
      ) : isError ? (
        <div className="rounded-xl border p-10 text-center text-sm text-red-600">
          Unable to load payments.
        </div>
      ) : payments.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center text-sm text-zinc-500">
          Nothing to show here.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b text-xs text-zinc-500">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Project / milestone</th>
                <th className="p-4 font-medium">Client → Freelancer</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Fees</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium" />
              </tr>
            </thead>

            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id} className="border-b align-top last:border-0">
                  <td className="p-4 text-zinc-500">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-4">
                    <p className="font-medium">{payment.project}</p>
                    <p className="text-xs text-zinc-500">{payment.milestone}</p>
                  </td>

                  <td className="p-4 text-zinc-600">
                    {payment.client} → {payment.freelancer}
                  </td>

                  <td className="p-4 font-medium">
                    {formatMoney(payment.amount, payment.currency)}
                    {payment.status === "REFUND_PENDING" &&
                      payment.refundAmount !== null && (
                        <p className="text-xs font-normal text-zinc-500">
                          refund {formatMoney(payment.refundAmount, payment.currency)}
                        </p>
                      )}
                  </td>

                  <td className="p-4 text-zinc-500">
                    {formatMoney(
                      payment.clientFee + payment.freelancerFee,
                      payment.currency,
                    )}
                  </td>

                  <td className="p-4">
                    <StatusBadge status={payment.status} />
                  </td>

                  <td className="p-4">
                    {payment.status === "REFUND_PENDING" && (
                      <RetryRefundButton payment={payment} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function WithdrawalsTab() {
  const [status, setStatus] = useState("");
  const { data: withdrawals = [], isLoading, isError } = useAdminWithdrawals(
    status || undefined,
  );

  return (
    <>
      <FilterChips options={WITHDRAWAL_FILTERS} value={status} onChange={setStatus} />

      <p className="mb-4 text-xs text-zinc-500">
        Read only. A transfer that has been pending or processing for over an
        hour is flagged. Check it in the Paystack dashboard.
      </p>

      {isLoading ? (
        <div className="h-32 animate-pulse rounded-xl bg-zinc-100" />
      ) : isError ? (
        <div className="rounded-xl border p-10 text-center text-sm text-red-600">
          Unable to load withdrawals.
        </div>
      ) : withdrawals.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center text-sm text-zinc-500">
          No withdrawals to show.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b text-xs text-zinc-500">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Freelancer</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Reference</th>
              </tr>
            </thead>

            <tbody>
              {withdrawals.map((withdrawal) => (
                <tr key={withdrawal._id} className="border-b align-top last:border-0">
                  <td className="p-4 text-zinc-500">
                    {new Date(withdrawal.createdAt).toLocaleString()}
                  </td>

                  <td className="p-4 font-medium">{withdrawal.freelancer}</td>

                  <td className="p-4 font-medium">{formatMoney(withdrawal.amount)}</td>

                  <td className="p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={withdrawal.status} />

                      {withdrawal.stuck && (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                          Looks stuck
                        </span>
                      )}
                    </div>

                    {withdrawal.failureReason && (
                      <p className="mt-1 text-xs text-red-600">
                        {withdrawal.failureReason}
                      </p>
                    )}
                  </td>

                  <td className="p-4 font-mono text-xs text-zinc-500">
                    {withdrawal.reference}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default function AdminFinancePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const tab: Tab =
    searchParams.get("tab") === "withdrawals" ? "withdrawals" : "payments";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <DashboardHeader
        title="Finance"
        description="Payments, dispute refunds and freelancer withdrawals."
      />

      <div className="mb-6 flex gap-6 border-b">
        {(
          [
            ["payments", "Payments & refunds"],
            ["withdrawals", "Withdrawals"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setSearchParams(value === "payments" ? {} : { tab: value })}
            className={`-mb-px border-b-2 pb-3 text-sm font-medium transition ${
              tab === value
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "payments" ? <PaymentsTab /> : <WithdrawalsTab />}
    </div>
  );
}
