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
