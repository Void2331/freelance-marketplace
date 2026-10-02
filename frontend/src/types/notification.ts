export type ActivityType =
  | "PROJECT_CREATED"
  | "CONTRACT_CREATED"
  | "PAYMENT_INITIALIZED"
  | "PAYMENT_FUNDED"
  | "MILESTONE_STARTED"
  | "WORK_SUBMITTED"
  | "REVISION_REQUESTED"
  | "MILESTONE_APPROVED"
  | "PAYMENT_RELEASED"
  | "DISPUTE_OPENED"
  | "DISPUTE_RESOLVED"
  | "PROJECT_COMPLETED"
  | "PROJECT_CANCELLED";

export interface Notification {
  _id: string;
  project: { _id: string; title: string } | string;
  milestone?: { _id: string; title: string } | string | null;
  user?: { _id: string; name: string } | string | null;
  type: ActivityType;
  message: string;
  createdAt: string;
}
