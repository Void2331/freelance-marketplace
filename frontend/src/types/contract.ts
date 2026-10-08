export type ContractStatus =
  | "PENDING_PAYMENT"
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED"
  | "CANCELLED"
  | "DISPUTED";

export interface ContractUser {
  _id: string;
  name: string;
  email?: string;
}

export interface ContractProject {
  _id: string;
  title?: string;
  description?: string;
  job?: {
    _id: string;
    title: string;
    description?: string;
    category?: string;
  } | null;
}

export interface ContractProposal {
  _id: string;
  bidAmount?: number;
  estimatedDuration?: string;
  coverLetter?: string;
}

export interface Contract {
  _id: string;
  project: ContractProject;
  client: ContractUser;
  freelancer: string | ContractUser;
  proposal: ContractProposal;

  contractType: "FIXED_PRICE";
  status: ContractStatus;

  startedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string;

  createdAt: string;
  updatedAt: string;
}