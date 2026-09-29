import { api } from "./api";

import type {
  Bank,
  SetupWithdrawalAccountRequest,
  Wallet,
  Withdrawal,
  WithdrawalAccount,
} from "@/types/wallet";

interface WalletResponse {
  success: boolean;
  data: { wallet: Wallet };
}

interface BanksResponse {
  success: boolean;
  data: { banks: Bank[] };
}

interface WithdrawalAccountResponse {
  success: boolean;
  message?: string;
  data: { account: WithdrawalAccount };
}

interface WithdrawalResponse {
  success: boolean;
  message?: string;
  data: { withdrawal: Withdrawal };
}

interface WithdrawalsResponse {
  success: boolean;
  data: { withdrawals: Withdrawal[] };
}

export async function getWallet(): Promise<Wallet> {
  const response = await api.get<WalletResponse>("/wallets");
  return response.data.data.wallet;
}

export async function getBanks(): Promise<Bank[]> {
  const response = await api.get<BanksResponse>("/wallets/banks");
  return response.data.data.banks;
}

export async function getWithdrawalAccount(): Promise<WithdrawalAccount> {
  const response = await api.get<WithdrawalAccountResponse>(
    "/wallets/withdrawal-account",
  );
  return response.data.data.account;
}

export async function setupWithdrawalAccount(
  data: SetupWithdrawalAccountRequest,
): Promise<WithdrawalAccount> {
  const response = await api.post<WithdrawalAccountResponse>(
    "/wallets/withdrawal-account",
    data,
  );
  return response.data.data.account;
}

export async function requestWithdrawal(
  amount: number,
): Promise<Withdrawal> {
  const response = await api.post<WithdrawalResponse>("/wallets/withdraw", {
    amount,
  });
  return response.data.data.withdrawal;
}

export async function listWithdrawals(): Promise<Withdrawal[]> {
  const response = await api.get<WithdrawalsResponse>("/wallets/withdrawals");
  return response.data.data.withdrawals;
}
