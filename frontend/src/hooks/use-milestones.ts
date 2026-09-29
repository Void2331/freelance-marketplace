import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createMilestone,
  deleteMilestone,
  getMilestone,
  getProjectMilestones,
  rejectMilestone,
  startMilestone,
  updateMilestone,
} from "@/services/milestone";

import {
  approveMilestone,
  requestChanges,
  submitMilestone,
} from "@/services/workroom";

import {
  initializePayment,
} from "@/services/payment";

import {
  projectKeys,
} from "./use-projects";

export const milestoneKeys = {
  all: ["milestones"] as const,

  project: (projectId: string) =>
    [...milestoneKeys.all, "project", projectId] as const,

  detail: (id: string) =>
    [...milestoneKeys.all, "detail", id] as const,
};

function refreshProject(
  queryClient: ReturnType<
    typeof useQueryClient
  >,
  projectId?: string,
) {
  queryClient.invalidateQueries({
    queryKey: milestoneKeys.all,
  });

  queryClient.invalidateQueries({
    queryKey: projectKeys.mine(),
  });

  if (projectId) {
    queryClient.invalidateQueries({
      queryKey:
        projectKeys.workroom(projectId),
    });

    queryClient.invalidateQueries({
      queryKey:
        projectKeys.detail(projectId),
    });
  }
}

export function useProjectMilestones(
  projectId?: string,
) {
  return useQuery({
    queryKey:
      milestoneKeys.project(
        projectId ?? "",
      ),

    queryFn: () =>
      getProjectMilestones(
        projectId!,
      ),

    enabled: Boolean(projectId),
  });
}

export function useMilestone(
  id?: string,
) {
  return useQuery({
    queryKey:
      milestoneKeys.detail(id ?? ""),

    queryFn: () =>
      getMilestone(id!),

    enabled: Boolean(id),
  });
}

export function useCreateMilestone() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: Parameters<
        typeof createMilestone
      >[1];
    }) =>
      createMilestone(
        projectId,
        data,
      ),

    onSuccess: (_, variables) => {
      refreshProject(
        queryClient,
        variables.projectId,
      );
    },
  });
}

export function useUpdateMilestone() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      projectId: string;
      data: Parameters<
        typeof updateMilestone
      >[1];
    }) =>
      updateMilestone(id, data),

    onSuccess: (_, variables) => {
      refreshProject(
        queryClient,
        variables.projectId,
      );
    },
  });
}

export function useDeleteMilestone() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
    }: {
      id: string;
      projectId: string;
    }) =>
      deleteMilestone(id),

    onSuccess: (_, variables) => {
      refreshProject(
        queryClient,
        variables.projectId,
      );
    },
  });
}

export function useStartMilestone() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
    }: {
      id: string;
      projectId: string;
    }) =>
      startMilestone(id),

    onSuccess: (_, variables) => {
      refreshProject(
        queryClient,
        variables.projectId,
      );
    },
  });
}

export function useSubmitMilestone() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      message,
    }: {
      id: string;
      projectId: string;
      message: string;
    }) =>
      submitMilestone(
        id,
        message,
      ),

    onSuccess: (_, variables) => {
      refreshProject(
        queryClient,
        variables.projectId,
      );
    },
  });
}

export function useRequestChanges() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      message,
    }: {
      id: string;
      projectId: string;
      message: string;
    }) =>
      requestChanges(
        id,
        message,
      ),

    onSuccess: (_, variables) => {
      refreshProject(
        queryClient,
        variables.projectId,
      );
    },
  });
}

export function useApproveMilestone() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
    }: {
      id: string;
      projectId: string;
    }) =>
      approveMilestone(id),

    onSuccess: (_, variables) => {
      refreshProject(
        queryClient,
        variables.projectId,
      );
    },
  });
}

export function useRejectMilestone() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
    }: {
      id: string;
      projectId: string;
    }) =>
      rejectMilestone(id),

    onSuccess: (_, variables) => {
      refreshProject(
        queryClient,
        variables.projectId,
      );
    },
  });
}

export function useInitializePayment() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      milestoneId,
    }: {
      milestoneId: string;
      projectId: string;
    }) =>
      initializePayment(
        milestoneId,
      ),

    onSuccess: (_, variables) => {
      refreshProject(
        queryClient,
        variables.projectId,
      );
    },
  });
}