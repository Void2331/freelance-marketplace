export type DisputeReason =
  | "NON_PAYMENT"
  | "POOR_QUALITY"
  | "SCOPE_DISAGREEMENT"
  | "MISSED_DEADLINE"
  | "NON_DELIVERY"
  | "FRAUD"
  | "OTHER";

export type DisputeStatus =
  | "OPEN"
  | "UNDER_REVIEW"
  | "AWAITING_RESPONSE"
  | "RESOLVED_CLIENT"
  | "RESOLVED_FREELANCER"
  | "PARTIAL_RESOLUTION"
  | "CLOSED";

export interface OpenDisputeRequest {
  reason: DisputeReason;
  description: string;
  evidence?: { name?: string; url: string; mimeType?: string }[];
}

export const DISPUTE_REASONS: {
  value: DisputeReason;
  label: string;
}[] = [
  { value: "NON_PAYMENT", label: "Non-payment" },
  { value: "POOR_QUALITY", label: "Poor quality of work" },
  { value: "SCOPE_DISAGREEMENT", label: "Scope disagreement" },
  { value: "MISSED_DEADLINE", label: "Missed deadline" },
  { value: "NON_DELIVERY", label: "Work not delivered" },
  { value: "FRAUD", label: "Fraud" },
  { value: "OTHER", label: "Other" },
];

export interface DisputeParty {
  _id: string;
  name: string;
  email?: string;
  role?: string;
}

export interface Dispute {
  _id: string;
  project:
    | string
    | {
        _id: string;
        title: string;
        currency: string;
        totalAmount: number;
        status: string;
      };
  milestone:
    | string
    | {
        _id: string;
        title: string;
        amount: number;
        currency: string;
        status: string;
      };
  openedBy: string | DisputeParty;
  against: string | DisputeParty;
  reason: DisputeReason;
  description: string;
  status: DisputeStatus;
  resolution?: string;
  resolvedBy?: string | { _id: string; name: string };
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type DisputeDecision =
  | "RESOLVED_CLIENT"
  | "RESOLVED_FREELANCER"
  | "PARTIAL_RESOLUTION";
