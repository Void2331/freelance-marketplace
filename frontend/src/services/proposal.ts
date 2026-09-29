import { api } from "./api";

import type {
  CreateProposalRequest,
  Proposal,
} from "@/types/proposal";

interface ProposalResponse {
  success: boolean;
  message?: string;
  data: {
    proposal: Proposal;
  };
}

interface ProposalsResponse {
  success: boolean;
  data: {
    proposals: Proposal[];
  };
}

interface AcceptProposalResponse {
  success: boolean;
  message: string;
  data: {
    projectId: string;
    contractId: string;
    milestoneId: string;
    paymentId: string;
    paymentReference: string;
    status: string;
  };
}

export async function createProposal(
  jobId: string,
  data: CreateProposalRequest,
): Promise<Proposal> {
  const response =
    await api.post<ProposalResponse>(
      `/jobs/${jobId}/proposals`,
      data,
    );

  return response.data.data.proposal;
}

export async function getMyProposals(): Promise<
  Proposal[]
> {
  const response =
    await api.get<ProposalsResponse>(
      "/proposals/my",
    );

  return response.data.data.proposals;
}

export async function getJobProposals(
  jobId: string,
): Promise<Proposal[]> {
  const response =
    await api.get<ProposalsResponse>(
      `/jobs/${jobId}/proposals`,
    );

  return response.data.data.proposals;
}

export async function getProposalById(
  id: string,
): Promise<Proposal> {
  const response =
    await api.get<ProposalResponse>(
      `/proposals/${id}`,
    );

  return response.data.data.proposal;
}

export async function acceptProposal(
  id: string,
): Promise<AcceptProposalResponse["data"]> {
  const response =
    await api.patch<AcceptProposalResponse>(
      `/proposals/${id}/accept`,
    );

  return response.data.data;
}

export async function rejectProposal(
  id: string,
): Promise<Proposal> {
  const response =
    await api.patch<ProposalResponse>(
      `/proposals/${id}/reject`,
    );

  return response.data.data.proposal;
}

export async function getClientProposals(): Promise<Proposal[]> {
  const response = await api.get<ProposalsResponse>("/proposals/client");

  return response.data.data.proposals;
}