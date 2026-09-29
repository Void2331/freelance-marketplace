import { api } from "./api";

import type {
  CreateMilestoneRequest,
  Milestone,
  UpdateMilestoneRequest,
} from "@/types/milestone";

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

export async function getProjectMilestones(
  projectId: string,
): Promise<Milestone[]> {
  const response =
    await api.get<MilestonesResponse>(
      `/projects/${projectId}/milestones`,
    );

  return response.data.data.milestones;
}

export async function getMilestone(
  id: string,
): Promise<Milestone> {
  const response =
    await api.get<MilestoneResponse>(
      `/milestones/${id}`,
    );

  return response.data.data.milestone;
}

export async function createMilestone(
  projectId: string,
  data: CreateMilestoneRequest,
): Promise<Milestone> {
  const response =
    await api.post<MilestoneResponse>(
      `/projects/${projectId}/milestones`,
      data,
    );

  return response.data.data.milestone;
}

export async function updateMilestone(
  id: string,
  data: UpdateMilestoneRequest,
): Promise<Milestone> {
  const response =
    await api.patch<MilestoneResponse>(
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
  const response =
    await api.patch<MilestoneResponse>(
      `/milestones/${id}/start`,
    );

  return response.data.data.milestone;
}

export async function rejectMilestone(
  id: string,
): Promise<Milestone> {
  const response =
    await api.patch<MilestoneResponse>(
      `/milestones/${id}/reject`,
    );

  return response.data.data.milestone;
}