import { api } from "./api";

import type {
  CreateJobRequest,
  Job,
  UpdateJobRequest,
} from "@/types/job";


interface JobResponse {
  success: boolean;
  message?: string;
  data: {
    job: Job;
  };
}

interface JobsResponse {
  success: boolean;
  data: {
    jobs: Job[];
  };
}

export interface JobFilters {
  category?: string;
  skill?: string;
}

export async function createJob(
  data: CreateJobRequest,
): Promise<Job> {
  const response =
    await api.post<JobResponse>(
      "/jobs",
      data,
    );

  return response.data.data.job;
}

export async function getJobs(
  filters?: JobFilters,
): Promise<Job[]> {
  const response =
    await api.get<JobsResponse>(
      "/jobs",
      {
        params: {
          category:
            filters?.category || undefined,
          skill:
            filters?.skill || undefined,
        },
      },
    );

  return response.data.data.jobs;
}

export async function getMyJobs(): Promise<Job[]> {
  const response =
    await api.get<JobsResponse>(
      "/jobs/my",
    );

  return response.data.data.jobs;
}

export async function getJobById(
  id: string,
): Promise<Job> {
  const response =
    await api.get<JobResponse>(
      `/jobs/${id}`,
    );

  return response.data.data.job;
}

export async function updateJob(
  id: string,
  data: UpdateJobRequest,
): Promise<Job> {
  const response =
    await api.patch<JobResponse>(
      `/jobs/${id}`,
      data,
    );

  return response.data.data.job;
}

export async function deleteJob(
  id: string,
): Promise<void> {
  await api.delete(`/jobs/${id}`);
}
interface AdminDeleteJobResponse {
  success: boolean;
  message: string;
  data: { job: Job; deleted: boolean };
}

// Admin only. If the job already has a project attached to it, the
// backend closes it (CANCELLED) instead of deleting it outright.
export async function adminDeleteJob(
  id: string,
): Promise<{ job: Job; deleted: boolean }> {
  const response = await api.delete<AdminDeleteJobResponse>(
    `/jobs/admin/${id}`,
  );

  return response.data.data;
}

// Admin only: every job regardless of status.
export async function getAllJobsAdmin(): Promise<Job[]> {
  const response = await api.get<JobsResponse>("/jobs/admin/all");
  return response.data.data.jobs;
}
