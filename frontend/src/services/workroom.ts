import { api } from "./api";

import type { Milestone } from "@/types/milestone";

interface MilestoneResponse {
  success: boolean;
  message: string;
  data?: {
    milestone?: Milestone;
  };
}

/**
 * Submit milestone work.
 *
 * Sends:
 * - message
 * - attachments[]
 *
 * Backend endpoint:
 * POST /milestones/:milestoneId/submit
 */



export async function submitMilestone(
  milestoneId: string,
  message: string,
  files: File[] = [],
) {
  const formData = new FormData();

  formData.append("message", message.trim());

  files.forEach((file) => {
    formData.append("attachments", file);
  });

  const response = await api.post<MilestoneResponse>(
    `/milestones/${milestoneId}/submit`,
    formData,
  );

  return response.data;
}


/**
 * Request changes to submitted milestone work.
 *
 * Backend endpoint:
 * POST /milestones/:milestoneId/request-changes
 */
export async function requestChanges(
  milestoneId: string,
  message: string,
) {
  const response = await api.post<MilestoneResponse>(
    `/milestones/${milestoneId}/request-changes`,
    {
      message: message.trim(),
    },
  );

  return response.data;
}

/**
 * Approve submitted milestone work.
 *
 * Backend endpoint:
 * POST /milestones/:milestoneId/approve
 */
export async function approveMilestone(
  milestoneId: string,
) {
  const response = await api.post<MilestoneResponse>(
    `/milestones/${milestoneId}/approve`,
  );

  return response.data;
}