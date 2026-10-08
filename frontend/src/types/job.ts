export type JobStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type BudgetType =
  | "FIXED"
  | "HOURLY";

export interface MilestonePlanItem {
  title: string;
  description: string;
  percentage: number;
}

export interface JobClient {
  _id: string;
  name: string;
  avatar?: string | null;
  location?: string;
  bio?: string;
}

export interface Job {
  _id: string;

  client: string | JobClient;

  title: string;
  description: string;

  category?: string;

  skills: string[];

  budget: number;

  budgetType: BudgetType;

  currency: string;

  deadline?: string | null;

  milestonePlan?: MilestonePlanItem[];

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
  milestonePlan?: MilestonePlanItem[];
}

export type UpdateJobRequest =
  Partial<CreateJobRequest>;