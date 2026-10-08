import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getAdminStats,
  listAdminPayments,
  listAdminWithdrawals,
  retryRefund,
} from "@/services/admin";

export const adminKeys = {
  all: ["admin"] as const,
  stats: () => [...adminKeys.all, "stats"] as const,
  payments: (status?: string) => [...adminKeys.all, "payments", status] as const,
  withdrawals: (status?: string) =>
    [...adminKeys.all, "withdrawals", status] as const,
};

export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: getAdminStats,
  });
}

export function useAdminPayments(status?: string) {
  return useQuery({
    queryKey: adminKeys.payments(status),
    queryFn: () => listAdminPayments(status),
  });
}

export function useAdminWithdrawals(status?: string) {
  return useQuery({
    queryKey: adminKeys.withdrawals(status),
    queryFn: () => listAdminWithdrawals(status),
  });
}

export function useRetryRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentId: string) => retryRefund(paymentId),

    onSuccess: () => {
      // statuses and the dashboard's "needs attention" counts both change
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}
