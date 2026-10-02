export type JobStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type BudgetType =
  | "FIXED"
  | "HOURLY";

export interface JobClient {
  _id: string;
  name: string;
  avatar?: string | null;
  location?: string;
  bio?: string;
}

export interface data {
  _id: string;
  client:
    | "Client"
    | JobClient[];

  title: string;
  description: string;

  category?: string;

  skills: string[];

  budget: number;

  budgetType: BudgetType;

  currency: string;

  deadline?: string | null;

  status: JobStatus;

  createdAt: string;
  updatedAt: string;
}

export interface CreateJobRequest {
  title: string;
  description: string;
  category?: string;
  skills?: string[];
  budget: number;
  budgetType?: BudgetType;
  deadline?: string;
}

export type UpdateJobRequest =
  Partial<CreateJobRequest>;