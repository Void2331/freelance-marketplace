import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getMessageConversations,
  getProjectMessages,
  getUnreadMessageCount,
  markProjectMessagesRead,
  sendMessage,
} from "@/services/message";
import type { SendMessageRequest } from "@/types/message";

export const messageKeys = {
  all: ["messages"] as const,

  conversations: () =>
    [...messageKeys.all, "conversations"] as const,

  project: (projectId: string) =>
    [...messageKeys.all, "project", projectId] as const,

  unreadCount: () =>
    [...messageKeys.all, "unread-count"] as const,
};

export function useMessageConversations() {
  return useQuery({
    queryKey: messageKeys.conversations(),
    queryFn: getMessageConversations,
    refetchInterval: 10000,
  });
}

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
    mutationFn: (projectId: string) =>
      markProjectMessagesRead(projectId),

    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({
        queryKey: messageKeys.project(projectId),
      });

      queryClient.invalidateQueries({
        queryKey: messageKeys.conversations(),
      });

      queryClient.invalidateQueries({
        queryKey: messageKeys.unreadCount(),
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

      queryClient.invalidateQueries({
        queryKey: messageKeys.conversations(),
      });
    },
  });
}

export function useUnreadMessageCount() {
  return useQuery({
    queryKey: messageKeys.unreadCount(),
    queryFn: getUnreadMessageCount,
    refetchInterval: 30000,
  });
}
