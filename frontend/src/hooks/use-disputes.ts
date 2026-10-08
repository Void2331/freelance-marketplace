import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  generateDisputeBrief,
  getProjectDisputes,
  listDisputes,
  openDispute,
  resolveDispute,
} from "@/services/dispute";
import type { DisputeDecision, OpenDisputeRequest } from "@/types/dispute";

export const disputeKeys = {
  all: ["disputes"] as const,
  list: (status?: string) => [...disputeKeys.all, "list", status] as const,
  project: (projectId: string) =>
    [...disputeKeys.all, "project", projectId] as const,
};

export function useAdminDisputes(status?: string) {
  return useQuery({
    queryKey: disputeKeys.list(status),
    queryFn: () => listDisputes(status),
  });
}

export function useProjectDisputes(projectId?: string) {
  return useQuery({
    queryKey: disputeKeys.project(projectId ?? ""),
    queryFn: () => getProjectDisputes(projectId!),
    enabled: Boolean(projectId),
  });
}

export function useOpenDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      milestoneId,
      data,
    }: {
      milestoneId: string;
      data: OpenDisputeRequest;
    }) => openDispute(milestoneId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: disputeKeys.all });
      // milestone flips to DISPUTED, so refresh project data too
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["milestones"] });
    },
  });
}

export function useResolveDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      disputeId,
      decision,
      resolution,
      freelancerPercent,
    }: {
      disputeId: string;
      decision: DisputeDecision;
        resolution: string;
        freelancerPercent?: number;
      }) => resolveDispute(disputeId, decision, resolution, freelancerPercent),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: disputeKeys.all });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["milestones"] });
    },
  });
}

export function useGenerateDisputeBrief() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (disputeId: string) => generateDisputeBrief(disputeId),

    onSuccess: () => {
      // the saved briefing comes back with the dispute list
      queryClient.invalidateQueries({ queryKey: disputeKeys.all });
    },
  });
}
