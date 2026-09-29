import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  adminDeleteJob,
  createJob,
  deleteJob,
  getAllJobsAdmin,
  getJobById,
  getJobs,
  getMyJobs,
  updateJob,
} from "@/services/job";

import type {
  CreateJobRequest,
  UpdateJobRequest,
} from "@/types/job";

export const jobKeys = {
  all: ["jobs"] as const,

  lists: () =>
    [...jobKeys.all, "list"] as const,

  browse: (filters?: {
    category?: string;
    skill?: string;
  }) =>
    [...jobKeys.lists(), "browse", filters] as const,

  mine: () =>
    [...jobKeys.lists(), "mine"] as const,

  admin: () =>
    [...jobKeys.lists(), "admin"] as const,

  detail: (id: string) =>
    [...jobKeys.all, "detail", id] as const,
};

export function useJobs(filters?: {
  category?: string;
  skill?: string;
}) {
  return useQuery({
    queryKey: jobKeys.browse(filters),
    queryFn: () => getJobs(filters),
  });
}

export function useAdminJobs() {
  return useQuery({
    queryKey: jobKeys.admin(),
    queryFn: getAllJobsAdmin,
  });
}

export function useMyJobs() {
  return useQuery({
    queryKey: jobKeys.mine(),
    queryFn: getMyJobs,
  });
}

export function useJob(id?: string) {
  return useQuery({
    queryKey: jobKeys.detail(id ?? ""),
    queryFn: () => getJobById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateJob() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      data: CreateJobRequest,
    ) => createJob(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: jobKeys.lists(),
      });
    },
  });
}

export function useUpdateJob() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateJobRequest;
    }) => updateJob(id, data),

    onSuccess: (job) => {
      queryClient.invalidateQueries({
        queryKey: jobKeys.lists(),
      });

      queryClient.setQueryData(
        jobKeys.detail(job._id),
        job,
      );
    },
  });
}

export function useDeleteJob() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      deleteJob(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: jobKeys.lists(),
      });
    },
  });
}
export function useAdminDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminDeleteJob(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
    },
  });
}
