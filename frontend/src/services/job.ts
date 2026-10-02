import { api } from "./api";

import type {
  CreateJobRequest,
  data,
  UpdateJobRequest,
} from "@/types/job";




interface JobResponse {
  success: boolean;
  message?: string;
  data: {
    job: data;
  };
}

interface JobsResponse {
  success: boolean;
  data: data[];
  totalDocuments?: number;
  totalPages?: number;
  currentPage?: number;
}

interface IJobResponse {
  data: data[],
  totalDocuments?: number,
  totalPages?: number,
  currentPage?: number
}

export interface JobFilters {
  category?: string;
  skill?: string;
  page?: number;
}

export async function createJob(
  data: CreateJobRequest,
): Promise<data> {
  const response =
    await api.post<JobResponse>(
      "/jobs",
      data,
    );

  return response.data.data.job;
}

export async function getJobs(
  filters?: JobFilters,
): Promise<IJobResponse> {
  const response = await api.get<JobsResponse>(
      `/jobs`,
      {
        params: {
          category:
            filters?.category || undefined,
          skill:
            filters?.skill || undefined,
          page:
            filters?.page || 1,
        },
      },
    );

  const givenData = {
    data: response.data.data,
    totalDocuments: response.data.totalDocuments,
    totalPages: response.data.totalPages,
    currentPage: response.data.currentPage, 
  };

  return givenData;
}

export async function getMyJobs(): Promise<data[]> {
  const response =
    await api.get<JobsResponse>(
      "/jobs/my",
    );

  return response.data.data;
}

export async function getJobById(
  id: string,
): Promise<data> {
  const response =
    await api.get<JobResponse>(
      `/jobs/${id}`,
    );

  return response.data.data.job;
}

export async function updateJob(
  id: string,
  data: UpdateJobRequest,
): Promise<data> {
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
  data: { job: data; deleted: boolean };
}

// Admin only. If the job already has a project attached to it, the
// backend closes it (CANCELLED) instead of deleting it outright.
export async function adminDeleteJob(
  id: string,
): Promise<{ job: data; deleted: boolean }> {
  const response = await api.delete<AdminDeleteJobResponse>(
    `/jobs/admin/${id}`,
  );

  return response.data.data;
}

// Admin only: every job regardless of status.
export async function getAllJobsAdmin(): Promise<data[]> {
  const response = await api.get<JobsResponse>("/jobs/admin/all");
  return response.data.data;
}
