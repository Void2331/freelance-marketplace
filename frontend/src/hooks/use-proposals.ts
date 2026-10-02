import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  acceptProposal,
  createProposal,
  getClientProposals,
  getJobProposals,
  getMyProposals,
  getProposalById,
  rejectProposal,
} from "@/services/proposal";

import type {
  CreateProposalRequest,
} from "@/types/proposal";

import { jobKeys } from "./use-jobs";

export const proposalKeys = {
  all: ["proposals"] as const,

  mine: () =>
    [...proposalKeys.all, "mine"] as const,

  client: () => 
    [...proposalKeys.all, "client"] as const,

  job: (jobId: string) =>
    [...proposalKeys.all, "job", jobId] as const,

  detail: (id: string) =>
    [...proposalKeys.all, "detail", id] as const,
};

export function useMyProposals() {
  return useQuery({
    queryKey: proposalKeys.mine(),
    queryFn: getMyProposals,
  });
}

export function useJobProposals(
  jobId?: string,
) {
  return useQuery({
    queryKey: proposalKeys.job(jobId ?? ""),
    queryFn: () =>
      getJobProposals(jobId!),
    enabled: Boolean(jobId),
  });
}

export function useProposal(
  id?: string,
) {
  return useQuery({
    queryKey: proposalKeys.detail(id ?? ""),
    queryFn: () =>
      getProposalById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateProposal() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      jobId,
      data,
    }: {
      jobId: string;
      data: CreateProposalRequest;
    }) =>
      createProposal(jobId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: proposalKeys.mine(),
      });

      queryClient.invalidateQueries({
        queryKey: proposalKeys.job(
          variables.jobId,
        ),
      });
    },
  });
}

export function useAcceptProposal() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      proposalId: string,
    ) => acceptProposal(proposalId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: proposalKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: jobKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
    },
  });
}

export function useRejectProposal() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      proposalId: string,
    ) => rejectProposal(proposalId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: proposalKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: jobKeys.all,
      });
    },
  });
}
export function useClientProposals() {
  return useQuery({
    queryKey: proposalKeys.client(),
    queryFn: getClientProposals,
  });
}