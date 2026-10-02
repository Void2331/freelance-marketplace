export type MilestoneStatus =
  | "PENDING"
  | "FUNDED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "REVISION_REQUESTED"
  | "APPROVED"
  | "RELEASED"
  | "REFUNDED"
  | "DISPUTED"
  | "CANCELLED"
  | "REJECTED";

export interface Milestone {
  _id: string;

  project: string;

  client: string;

  freelancer: string;

  payment?: string | null;

  title: string;

  description: string;

  amount: number;

  currency: string;

  order: number;

  dueDate?: string | null;

  status: MilestoneStatus;

  submissionNote?: string;

  submittedAt?: string | null;

  approvedAt?: string | null;

  releasedAt?: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface CreateMilestoneRequest {
  title: string;
  description: string;
  amount: number;
  dueDate: string;
}

export interface UpdateMilestoneRequest {
  title?: string;
  description?: string;
  amount?: number;
  dueDate?: string;
}