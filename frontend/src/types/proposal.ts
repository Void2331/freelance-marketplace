import type { Job } from "./job";
import type { TrustScore } from "./trust";

export type ProposalStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";

export interface ProposalFreelancer {
  _id: string;
  name: string;
  email?: string;
  avatar?: string | null;
  bio?: string;
  skills?: string[];
  hourlyRate?: number;
  trust?: TrustScore;
}

export interface Proposal {
  _id: string;

  job:
    | string
    | Job;

  freelancer:
    | string
    | ProposalFreelancer;

  coverLetter: string;

  bidAmount: number;

  estimatedDuration: number;

  status: ProposalStatus;

  createdAt: string;
  updatedAt: string;
}

export interface CreateProposalRequest {
  coverLetter: string;
  bidAmount: number;
  estimatedDuration: number;
}