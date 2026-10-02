import { api } from "./api";

import type { Milestone } from "@/types/milestone";

interface MilestoneResponse {
  success: boolean;
  message: string;
  data?: {
    milestone?: Milestone;
  };
}

export async function submitMilestone(
  milestoneId: string,
  message: string,
) {
  const response =
    await api.post<MilestoneResponse>(
      `/milestones/${milestoneId}/submit`,
      {
        message,
      },
    );

  return response.data;
}

export async function requestChanges(
  milestoneId: string,
  message: string,
) {
  const response =
    await api.post<MilestoneResponse>(
      `/milestones/${milestoneId}/request-changes`,
      {
        message,
      },
    );

  return response.data;
}

export async function approveMilestone(
  milestoneId: string,
) {
  const response =
    await api.post<MilestoneResponse>(
      `/milestones/${milestoneId}/approve`,
    );

  return response.data;
}