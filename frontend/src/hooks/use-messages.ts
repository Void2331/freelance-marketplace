import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getProjectMessages,
  getUnreadMessageCount,
  markProjectMessagesRead,
  sendMessage,
} from "@/services/message";
import type { SendMessageRequest } from "@/types/message";

export const messageKeys = {
  all: ["messages"] as const,
  project: (projectId: string) =>
    [...messageKeys.all, "project", projectId] as const,
};

// Polls while the workroom is open so both participants see new
// messages without needing real-time sockets wired up.
export function useProjectMessages(projectId?: string) {
  return useQuery({
    queryKey: messageKeys.project(projectId ?? ""),
    queryFn: () => getProjectMessages(projectId!),
    enabled: Boolean(projectId),
    refetchInterval: 8000,
  });
}

export function useMarkMessagesRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => markProjectMessagesRead(projectId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...messageKeys.all, "unread-count"],
      });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: SendMessageRequest;
    }) => sendMessage(projectId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: messageKeys.project(variables.projectId),
      });
    },
  });
}

export function useUnreadMessageCount() {
  return useQuery({
    queryKey: [...messageKeys.all, "unread-count"],
    queryFn: getUnreadMessageCount,
    refetchInterval: 30000,
  });
}
