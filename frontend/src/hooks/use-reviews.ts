import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { createReview, getProjectReviews } from "@/services/review";
import type { CreateReviewRequest } from "@/types/review";

export const reviewKeys = {
  all: ["reviews"] as const,
  project: (projectId: string) =>
    [...reviewKeys.all, "project", projectId] as const,
};

export function useProjectReviews(projectId?: string) {
  return useQuery({
    queryKey: reviewKeys.project(projectId ?? ""),
    queryFn: () => getProjectReviews(projectId!),
    enabled: Boolean(projectId),
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: CreateReviewRequest;
    }) => createReview(projectId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: reviewKeys.project(variables.projectId),
      });
    },
  });
}
