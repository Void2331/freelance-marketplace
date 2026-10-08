
import { api } from "./api";
import type { Job } from "@/types/job";


interface JobResponse {
  success: boolean;
  data: Job;
}

interface JobsResponse {
  success: boolean;
  data: Job[];
  totalDocuments?: number;
  totalPages?: number;
  currentPage?: number;
}

// /jobs/my and /jobs/admin/all wrap the array:
// { data: { jobs: [...] } }
interface JobListResponse {
  success: boolean;
  data: {
    jobs: Job[];
  };
}

interface IJobResponse {
  data: Job[];
  totalDocuments?: number;
  totalPages?: number;
  currentPage?: number;
}

export interface JobFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  budgetType?: string;
  minBudget?: number;
  maxBudget?: number;
  skills?: string[];
}

export async function getJobs(
  filters?: JobFilters,
): Promise<IJobResponse> {
  const response = await api.get<JobsResponse>("/jobs", {
    params: {
      ...filters,
      skills: filters?.skills?.join(","),
    },
  });

  const givenData = response.data;

  return {
    data: givenData.data,
    totalDocuments: givenData.totalDocuments,
    totalPages: givenData.totalPages,
    currentPage: givenData.currentPage,
  };
}

export async function getMyJobs(): Promise<Job[]> {
  const response =
    await api.get<JobListResponse>("/jobs/my");

  return response.data.data.jobs;
}

export async function getJobById(
  id: string,
): Promise<Job> {
  const response = await api.get<JobResponse>(
    `/jobs/${id}`,
  );

  return response.data.data;
}

export async function createJob(
  payload: Partial<Job>,
): Promise<Job> {
  const response = await api.post<JobResponse>(
    "/jobs",
    payload,
  );

  return response.data.data;
}

export async function updateJob(
  id: string,
  payload: Partial<Job>,
): Promise<Job> {
  const response = await api.patch<JobResponse>(
    `/jobs/${id}`,
    payload,
  );

  return response.data.data;
}

export async function deleteJob(
  id: string,
): Promise<void> {
  await api.delete(`/jobs/${id}`);
}
interface AdminDeleteJobResponse {
  success: boolean;
  message?: string;
  data?: {
    deleted?: boolean;
  };
}

export async function adminDeleteJob(
  id: string,
): Promise<{ deleted: boolean }> {
  const response =
    await api.delete<AdminDeleteJobResponse>(
      `/jobs/admin/${id}`,
    );

  return {
    deleted: response.data.data?.deleted ?? true,
  };
}

// Admin only: every job regardless of status.
export async function getAllJobsAdmin(): Promise<Job[]> {
  const response =
    await api.get<JobListResponse>("/jobs/admin/all");

  return response.data.data.jobs;
}