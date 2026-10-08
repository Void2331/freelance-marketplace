export interface Wallet {
  _id: string;
  user: string;
  pendingBalance: number;
  availableBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bank {
  name: string;
  code: string;
}

export interface WithdrawalAccount {
  _id: string;
  freelancer: string;
  bankCode: string;
  bankName: string;
  accountName: string;
  recipientCode: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SetupWithdrawalAccountRequest {
  bankCode: string;
  bankName: string;
  accountNumber: string;
}

export type WithdrawalStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED"
  | "REVERSED";

export interface Withdrawal {
  _id: string;
  freelancer: string;
  withdrawalAccount: string;
  amount: number;
  reference: string;
  status: WithdrawalStatus;
  failureReason?: string;
  processedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
export type WalletTransactionType =
  | "MILESTONE_EARNING"
  | "PLATFORM_FEE"
  | "WITHDRAWAL"
  | "REFUND"
  | "REVERSAL"
  | "ADJUSTMENT";

export type WalletTransactionBalanceType =
  | "PENDING"
  | "AVAILABLE";

export type WalletTransactionDirection =
  | "CREDIT"
  | "DEBIT";

export interface WalletTransaction {
  _id: string;
  wallet: string;
  user: string;

  type: WalletTransactionType;
  balanceType: WalletTransactionBalanceType;
  direction: WalletTransactionDirection;

  amount: number;
  balanceBefore: number;
  balanceAfter: number;

  project?: {
    _id: string;
    title?: string;
  } | null;

  milestone?: {
    _id: string;
    title?: string;
    amount?: number;
  } | null;

  payment?: {
    _id: string;
    amount?: number;
    currency?: string;
    status?: string;
  } | null;

  withdrawal?: {
    _id: string;
    amount?: number;
    status?: string;
    reference?: string;
  } | null;

  reference: string;
  description: string;

  createdAt: string;
  updatedAt: string;
}