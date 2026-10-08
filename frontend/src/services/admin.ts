import { api } from "./api";

import type {
  AdminPayment,
  AdminStats,
  AdminWithdrawal,
} from "@/types/admin";

export async function getAdminStats(): Promise<AdminStats> {
  const response = await api.get<{
    success: boolean;
    data: { stats: AdminStats };
  }>("/admin/stats");

  return response.data.data.stats;
}

export async function listAdminPayments(status?: string): Promise<AdminPayment[]> {
  const response = await api.get<{
    success: boolean;
    data: { payments: AdminPayment[] };
  }>("/admin/payments", { params: status ? { status } : undefined });

  return response.data.data.payments;
}

export async function listAdminWithdrawals(
  status?: string,
): Promise<AdminWithdrawal[]> {
  const response = await api.get<{
    success: boolean;
    data: { withdrawals: AdminWithdrawal[] };
  }>("/admin/withdrawals", { params: status ? { status } : undefined });

  return response.data.data.withdrawals;
}

export async function retryRefund(
  paymentId: string,
): Promise<{ message: string; outcome: string }> {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: { outcome: string };
  }>(
    `/admin/payments/${paymentId}/retry-refund`,
    {},
    // Paystack is asked twice (look up, then refund), so allow extra time.
    { timeout: 60000 },
  );

  return {
    message: response.data.message,
    outcome: response.data.data.outcome,
  };
}
