export type MilestoneSubmissionStatus =
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REVISION_REQUESTED"
  | "DISPUTED";

export interface DeliverableAttachment {
  _id?: string;
  id?: string;
  name: string;
  url: string;
  mimeType?: string;
  size?: number;
  type?: string;
}

export interface MilestoneSubmission {
  _id: string;

  milestone:
    | string
    | {
        _id: string;
      };

  project:
    | string
    | {
        _id: string;
      };

  freelancer:
    | string
    | {
        _id: string;
      };

  message: string;

  attachments: DeliverableAttachment[];

  version: number;

  status: MilestoneSubmissionStatus;

  submittedAt?: string;

  reviewedAt?: string;

  createdAt: string;

  updatedAt: string;
}