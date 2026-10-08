import { api } from "./api";

import type {
  DeliverableAttachment,
  MilestoneSubmission,
} from "@/types/milestoneSubmission";

interface UploadResponse {
  success: boolean;

  message: string;

  data?: {
    attachments: DeliverableAttachment[];
  };
}

interface SubmissionsResponse {
  success: boolean;

  message: string;

  data?: {
    submissions: MilestoneSubmission[];
  };
}

export async function uploadMilestoneDeliverables(
  milestoneId: string,
  files: File[],
  onProgress?: (
    progress: number,
  ) => void,
): Promise<DeliverableAttachment[]> {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  const response =
    await api.post<UploadResponse>(
      `/milestones/${milestoneId}/deliverables/upload`,
      formData,
      {
        onUploadProgress: (event) => {
          if (!event.total) {
            return;
          }

          const progress = Math.round(
            (event.loaded * 100) /
              event.total,
          );

          onProgress?.(progress);
        },
      },
    );

  return (
    response.data.data?.attachments || []
  );
}

export async function getMilestoneSubmissions(
  milestoneId: string,
): Promise<MilestoneSubmission[]> {
  const response =
    await api.get<SubmissionsResponse>(
      `/milestones/${milestoneId}/submissions`,
    );

  return (
    response.data.data?.submissions || []
  );
}