import { api } from "./api";

import type {
  CreateMilestoneRequest,
  Milestone,
  UpdateMilestoneRequest,
} from "@/types/milestone";

import type {
  DeliverableAttachment,
  MilestoneSubmission,
} from "@/types/milestoneSubmission";

interface MilestonesResponse {
  success: boolean;
  data: {
    milestones: Milestone[];
  };
}

interface MilestoneResponse {
  success: boolean;
  message?: string;
  data: {
    milestone: Milestone;
  };
}

/* =========================================================
   MILESTONE CRUD
========================================================= */

export async function getProjectMilestones(
  projectId: string,
): Promise<Milestone[]> {
  const response = await api.get<MilestonesResponse>(
    `/projects/${projectId}/milestones`,
  );

  return response.data.data.milestones;
}

export async function getMilestone(
  id: string,
): Promise<Milestone> {
  const response = await api.get<MilestoneResponse>(
    `/milestones/${id}`,
  );

  return response.data.data.milestone;
}

export async function createMilestone(
  projectId: string,
  data: CreateMilestoneRequest,
): Promise<Milestone> {
  const response = await api.post<MilestoneResponse>(
    `/projects/${projectId}/milestones`,
    data,
  );

  return response.data.data.milestone;
}

export async function updateMilestone(
  id: string,
  data: UpdateMilestoneRequest,
): Promise<Milestone> {
  const response = await api.patch<MilestoneResponse>(
    `/milestones/${id}`,
    data,
  );

  return response.data.data.milestone;
}

export async function deleteMilestone(
  id: string,
): Promise<void> {
  await api.delete(`/milestones/${id}`);
}

export async function startMilestone(
  id: string,
): Promise<Milestone> {
  const response = await api.patch<MilestoneResponse>(
    `/milestones/${id}/start`,
  );

  return response.data.data.milestone;
}

export async function rejectMilestone(
  id: string,
): Promise<Milestone> {
  const response = await api.patch<MilestoneResponse>(
    `/milestones/${id}/reject`,
  );

  return response.data.data.milestone;
}

/* =========================================================
   MILESTONE SUBMISSIONS / DELIVERABLES
========================================================= */

interface MilestoneSubmissionsResponse {
  success: boolean;
  message?: string;
  data: {
    submissions: MilestoneSubmission[];
  };
}

interface MilestoneSubmissionResponse {
  success: boolean;
  message?: string;
  data: {
    submission: MilestoneSubmission;
  };
}

/**
 * Get all submissions/deliverables for a milestone.
 */
export async function getMilestoneSubmissions(
  milestoneId: string,
): Promise<MilestoneSubmission[]> {
  const response =
    await api.get<MilestoneSubmissionsResponse>(
      `/milestones/${milestoneId}/submissions`,
    );

  return response.data.data.submissions;
}

/**
 * Upload/submit milestone deliverables.
 *
 * `attachments` should contain the uploaded file metadata
 * expected by your backend.
 */
export async function uploadMilestoneDeliverables(
  milestoneId: string,
  message: string,
  attachments: DeliverableAttachment[] = [],
): Promise<MilestoneSubmission> {
  const response =
    await api.post<MilestoneSubmissionResponse>(
      `/milestones/${milestoneId}/submit`,
      {
        message,
        attachments,
      },
    );

  return response.data.data.submission;
}