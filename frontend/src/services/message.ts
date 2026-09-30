import { api } from "./api";

import type {
  Message,
  MessageConversation,
  SendMessageRequest,
} from "@/types/message";

interface SendMessageResponse {
  success: boolean;
  message: string;
  data: { message: Message };
}

interface MessagesResponse {
  success: boolean;
  data: { messages: Message[] };
}

interface ConversationsResponse {
  success: boolean;
  data: { conversations: MessageConversation[] };
}

export async function sendMessage(
  projectId: string,
  data: SendMessageRequest,
): Promise<Message> {
  const response = await api.post<SendMessageResponse>(
    `/projects/${projectId}/messages`,
    data,
  );

  return response.data.data.message;
}

export async function getProjectMessages(
  projectId: string,
): Promise<Message[]> {
  const response = await api.get<MessagesResponse>(
    `/projects/${projectId}/messages`,
  );

  return response.data.data.messages;
}

export async function getMessageConversations(): Promise<
  MessageConversation[]
> {
  const response = await api.get<ConversationsResponse>(
    "/messages/conversations",
  );

  return response.data.data.conversations;
}

interface MarkReadResponse {
  success: boolean;
  message: string;
}

export async function markProjectMessagesRead(
  projectId: string,
): Promise<void> {
  await api.patch<MarkReadResponse>(
    `/projects/${projectId}/messages/read`,
  );
}

interface UnreadCountResponse {
  success: boolean;
  data: { count: number };
}

export async function getUnreadMessageCount(): Promise<number> {
  const response = await api.get<UnreadCountResponse>(
    "/messages/unread-count",
  );

  return response.data.data.count;
}
