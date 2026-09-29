import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getBanks,
  getWallet,
  getWithdrawalAccount,
  listWithdrawals,
  requestWithdrawal,
  setupWithdrawalAccount,
} from "@/services/wallet";

import type { SetupWithdrawalAccountRequest } from "@/types/wallet";

export const walletKeys = {
  all: ["wallet"] as const,
  banks: () => [...walletKeys.all, "banks"] as const,
  account: () => [...walletKeys.all, "account"] as const,
  withdrawals: () => [...walletKeys.all, "withdrawals"] as const,
};

export function useWallet() {
  return useQuery({
    queryKey: walletKeys.all,
    queryFn: getWallet,
  });
}

export function useBanks() {
  return useQuery({
    queryKey: walletKeys.banks(),
    queryFn: getBanks,
    staleTime: 1000 * 60 * 60,
  });
}

export function useWithdrawalAccount() {
  return useQuery({
    queryKey: walletKeys.account(),
    queryFn: getWithdrawalAccount,
    retry: false,
  });
}

export function useWithdrawals() {
  return useQuery({
    queryKey: walletKeys.withdrawals(),
    queryFn: listWithdrawals,
  });
}

export function useSetupWithdrawalAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SetupWithdrawalAccountRequest) =>
      setupWithdrawalAccount(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.account() });
    },
  });
}

export function useRequestWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (amount: number) => requestWithdrawal(amount),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      queryClient.invalidateQueries({ queryKey: walletKeys.withdrawals() });
    },
  });
}
