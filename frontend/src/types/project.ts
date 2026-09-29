export type ProjectStatus =
  | "AWAITING_PAYMENT"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "DISPUTED";

export type ContractStatus =
  | "PENDING_PAYMENT"
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED"
  | "CANCELLED"
  | "DISPUTED";

export interface ProjectUser {
  _id: string;
  name: string;
  email?: string;
  avatar?: string | null;
}

export interface ProjectJob {
  _id: string;
  title: string;
}

export interface Project {
  _id: string;
  job:
    | string
    | ProjectJob;
  client:
    | string
    | ProjectUser;
  freelancer:
    | string
    | ProjectUser;
  proposal: string;
  contract?: string;
  title: string;
  description: string;
  totalAmount: number;
  currency: string;
  status: ProjectStatus;
  funded: boolean;
  fundedAt?: string | null;
  paymentReference?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Contract {
  _id: string;
  project: string;
  client:
    | string
    | ProjectUser;
  freelancer:
    | string
    | ProjectUser;
  proposal: string;
  contractType: "FIXED_PRICE";
  status: ContractStatus;
  startedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectActivity {
  _id: string;
  project: string;
  user?: ProjectUser | null;
  type: string;
  message: string;
  milestone?: {
    _id: string;
    title: string;
    amount: number;
    status: string;
  } | null;
  createdAt: string;
}

export interface Workroom {
  project: Project;
  contract: Contract | null;
  milestones: import("./milestone").Milestone[];
  activities: ProjectActivity[];
}