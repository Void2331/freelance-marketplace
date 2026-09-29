import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Banknote, Clock3, Loader2, TrendingUp, Wallet } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SectionCard } from "@/components/dashboard/section-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";

import {
  useBanks,
  useRequestWithdrawal,
  useSetupWithdrawalAccount,
  useWallet,
  useWithdrawalAccount,
  useWithdrawals,
} from "@/hooks/use-wallet";

import {
  withdrawalAccountSchema,
  withdrawalRequestSchema,
  type WithdrawalAccountFormValues,
  type WithdrawalRequestFormValues,
} from "@/lib/validations/withdrawal";
import { getErrorMessage } from "@/lib/errors";

function money(currency: string | undefined, amount: number | undefined) {
  return `${currency ?? "NGN"} ${(amount ?? 0).toLocaleString()}`;
}


function AccountSetupForm() {
  const { data: banks = [], isLoading: banksLoading } = useBanks();
  const setup = useSetupWithdrawalAccount();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<WithdrawalAccountFormValues>({
    resolver: zodResolver(withdrawalAccountSchema),
  });

  async function onSubmit(values: WithdrawalAccountFormValues) {
    try {
      await setup.mutateAsync(values);
      toast.success("Bank account saved");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to save bank account"));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Bank</label>

        <select
          className="mt-2 h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          defaultValue=""
          disabled={banksLoading}
          {...register("bankCode", {
            onChange: (event) => {
              const bank = banks.find((item) => item.code === event.target.value);
              setValue("bankName", bank?.name ?? "", { shouldValidate: true });
            },
          })}
        >
          <option value="" disabled>
            {banksLoading ? "Loading banks..." : "Select your bank"}
          </option>
          {banks.map((bank) => (
            <option key={bank.code} value={bank.code}>
              {bank.name}
            </option>
          ))}
        </select>

        <input type="hidden" {...register("bankName")} />

        {errors.bankCode && (
          <p className="mt-1 text-xs text-red-600">{errors.bankCode.message}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium">Account number</label>

        <Input
          className="mt-2"
          inputMode="numeric"
          maxLength={10}
          placeholder="0123456789"
          {...register("accountNumber")}
        />

        {errors.accountNumber && (
          <p className="mt-1 text-xs text-red-600">
            {errors.accountNumber.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={setup.isPending}>
        {setup.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save bank account
      </Button>
    </form>
  );
}

function WithdrawForm({ available }: { available: number }) {
  const withdraw = useRequestWithdrawal();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WithdrawalRequestFormValues>({
    resolver: zodResolver(withdrawalRequestSchema),
  });

  async function onSubmit(values: WithdrawalRequestFormValues) {
    if (values.amount > available) {
      toast.error("Amount exceeds your available balance");
      return;
    }

    try {
      await withdraw.mutateAsync(values.amount);
      toast.success("Withdrawal requested");
      reset();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to request withdrawal"));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Amount</label>

        <Input
          type="number"
          min="1"
          className="mt-2"
          placeholder="50000"
          {...register("amount", { valueAsNumber: true })}
        />

        {errors.amount && (
          <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>
        )}
      </div>

      <Button type="submit" disabled={withdraw.isPending || available <= 0}>
        {withdraw.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Withdraw funds
      </Button>
    </form>
  );
}

export default function FreelancerWalletPage() {
  const { data: wallet, isLoading } = useWallet();
  const { data: account, isLoading: accountLoading } = useWithdrawalAccount();
  const { data: withdrawals = [] } = useWithdrawals();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <DashboardHeader
        title="Wallet"
        description="Track your earnings and withdraw to your bank account."
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-xl bg-zinc-100"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Available balance"
            value={money(wallet?.currency, wallet?.availableBalance)}
            description="Ready to withdraw"
            icon={Wallet}
          />

          <StatCard
            title="Pending balance"
            value={money(wallet?.currency, wallet?.pendingBalance)}
            description="Held in escrow"
            icon={Clock3}
          />

          <StatCard
            title="Total earned"
            value={money(wallet?.currency, wallet?.totalEarned)}
            icon={TrendingUp}
          />

          <StatCard
            title="Total withdrawn"
            value={money(wallet?.currency, wallet?.totalWithdrawn)}
            icon={Banknote}
          />
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <SectionCard
          title={account ? "Withdraw funds" : "Add a bank account"}
          description={
            account
              ? `Paying out to ${account.bankName} · ${account.accountName}`
              : "Add a bank account before you can withdraw."
          }
        >
          {accountLoading ? (
            <div className="h-24 animate-pulse rounded-lg bg-zinc-100" />
          ) : account ? (
            <WithdrawForm available={wallet?.availableBalance ?? 0} />
          ) : (
            <AccountSetupForm />
          )}
        </SectionCard>

        <SectionCard
          title="Withdrawal history"
          description="Your recent payout requests"
        >
          {withdrawals.length === 0 ? (
            <p className="text-center text-sm text-zinc-400">
              No withdrawals yet.
            </p>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal._id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {money(wallet?.currency, withdrawal.amount)}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {new Date(withdrawal.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <StatusBadge status={withdrawal.status} />
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
