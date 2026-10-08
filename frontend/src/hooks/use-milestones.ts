import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createMilestone,
  deleteMilestone,
  getMilestone,
  getMilestoneSubmissions,
  getProjectMilestones,
  rejectMilestone,
  startMilestone,
  updateMilestone,
  uploadMilestoneDeliverables,
} from "@/services/milestone";

import type {
  MilestoneSubmission,
  DeliverableAttachment,
} from "@/types/milestoneSubmission";

import {
  approveMilestone,
  requestChanges,
  submitMilestone,
} from "@/services/workroom";

import { initializePayment } from "@/services/payment";

import { projectKeys } from "./use-projects";

/* ============================================================
   QUERY KEYS
============================================================ */

export const milestoneKeys = {
  all: ["milestones"] as const,

  project: (projectId: string) =>
    [...milestoneKeys.all, "project", projectId] as const,

  detail: (id: string) =>
    [...milestoneKeys.all, "detail", id] as const,

  submissions: (milestoneId: string) =>
    [...milestoneKeys.all, "submissions", milestoneId] as const,
};

/* ============================================================
   TYPES
============================================================ */

export interface UploadMilestoneDeliverablesInput {
  milestoneId: string;
  projectId: string;
  message: string;
  files?: File[];
  attachments?: DeliverableAttachment[];
  onProgress?: (progress: number) => void;
}
/* ============================================================
   HELPER
   Refresh all project/milestone-related queries.
============================================================ */

function refreshProject(
  queryClient: ReturnType<typeof useQueryClient>,
  projectId?: string,
) {
  // Refresh all milestone queries
  queryClient.invalidateQueries({
    queryKey: milestoneKeys.all,
  });

  // Refresh user's projects
  queryClient.invalidateQueries({
    queryKey: projectKeys.mine(),
  });

  // Refresh project-specific data
  if (projectId) {
    queryClient.invalidateQueries({
      queryKey: projectKeys.workroom(projectId),
    });

    queryClient.invalidateQueries({
      queryKey: projectKeys.detail(projectId),
    });
  }
}

/* ============================================================
   GET PROJECT MILESTONES
============================================================ */

export function useProjectMilestones(
  projectId?: string,
) {
  return useQuery({
    queryKey: milestoneKeys.project(
      projectId ?? "",
    ),

    queryFn: () =>
      getProjectMilestones(projectId!),

    enabled: Boolean(projectId),
  });
}

/* ============================================================
   GET SINGLE MILESTONE
============================================================ */

export function useMilestone(
  id?: string,
) {
  return useQuery({
    queryKey: milestoneKeys.detail(
      id ?? "",
    ),

    queryFn: () =>
      getMilestone(id!),

    enabled: Boolean(id),
  });
}

/* ============================================================
   CREATE MILESTONE
============================================================ */

export function useCreateMilestone() {
  const queryClient = useQueryClient();

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

/* ============================================================
   UPDATE MILESTONE
============================================================ */

export function useUpdateMilestone() {
  const queryClient = useQueryClient();

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
      updateMilestone(
        id,
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

/* ============================================================
   DELETE MILESTONE
============================================================ */

export function useDeleteMilestone() {
  const queryClient = useQueryClient();

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

/* ============================================================
   START MILESTONE
============================================================ */

export function useStartMilestone() {
  const queryClient = useQueryClient();

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

/* ============================================================
   SUBMIT MILESTONE
   Freelancer submits milestone for review.
============================================================ */
export function useSubmitMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      milestoneId,
      message,
      files,
    }: {
      milestoneId: string;
      projectId: string;
      message: string;
      files?: File[];
    }) =>
      submitMilestone(
        milestoneId,
        message,
        files,
      ),

    onSuccess: (_, variables) => {
      refreshProject(
        queryClient,
        variables.projectId,
      );

      queryClient.invalidateQueries({
        queryKey:
          milestoneKeys.submissions(
            variables.milestoneId,
          ),
      });
    },
  });
}

/* ============================================================
   REQUEST CHANGES
   Client requests revisions from freelancer.
============================================================ */

export function useRequestChanges() {
  const queryClient = useQueryClient();

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

      queryClient.invalidateQueries({
        queryKey:
          milestoneKeys.submissions(
            variables.id,
          ),
      });
    },
  });
}

/* ============================================================
   APPROVE MILESTONE
   Client approves submitted milestone.
============================================================ */

export function useApproveMilestone() {
  const queryClient = useQueryClient();

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

      queryClient.invalidateQueries({
        queryKey:
          milestoneKeys.submissions(
            variables.id,
          ),
      });
    },
  });
}

/* ============================================================
   REJECT MILESTONE
============================================================ */

export function useRejectMilestone() {
  const queryClient = useQueryClient();

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

      queryClient.invalidateQueries({
        queryKey:
          milestoneKeys.submissions(
            variables.id,
          ),
      });
    },
  });
}

/* ============================================================
   INITIALIZE PAYMENT
============================================================ */

export function useInitializePayment() {
  const queryClient = useQueryClient();

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

/* ============================================================
   GET MILESTONE SUBMISSIONS
============================================================ */

export function useMilestoneSubmissions(
  milestoneId?: string,
) {
  return useQuery<MilestoneSubmission[]>({
    queryKey: milestoneKeys.submissions(
      milestoneId ?? "",
    ),

    queryFn: () =>
      getMilestoneSubmissions(
        milestoneId!,
      ),

    enabled: Boolean(milestoneId),
  });
}

/* ============================================================
   UPLOAD MILESTONE DELIVERABLES
   Freelancer uploads completed work/files.
============================================================ */

export function useUploadMilestoneDeliverables() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      milestoneId,
      message,
      files,
      attachments,
    }: UploadMilestoneDeliverablesInput) => {
      // Already-uploaded attachments: pass straight through
      if (attachments?.length) {
        return uploadMilestoneDeliverables(milestoneId, message, attachments);
      }

      // Raw File objects: use the service that accepts File[]
      if (files?.length) {
        return submitMilestone(milestoneId, message, files);
      }

      // Message only
      return uploadMilestoneDeliverables(milestoneId, message, undefined);
    },

    onSuccess: (_, variables) => {
      // Refresh submissions for this milestone
      queryClient.invalidateQueries({
        queryKey: milestoneKeys.submissions(variables.milestoneId),
      });

      // Refresh milestone data
      queryClient.invalidateQueries({
        queryKey: milestoneKeys.all,
      });

      // Refresh project/workroom
      refreshProject(queryClient, variables.projectId);
    },
  });
}