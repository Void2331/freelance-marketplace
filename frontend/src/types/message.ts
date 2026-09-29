export interface MessageUser {
  _id: string;
  name: string;
  avatar?: string | null;
}

export interface MessageAttachment {
  name?: string;
  url: string;
  mimeType?: string;
  size?: number;
}

export interface Message {
  _id: string;
  project: string;
  sender: string | MessageUser;
  receiver: string | MessageUser;
  message: string;
  attachments: MessageAttachment[];
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageRequest {
  message: string;
  attachments?: MessageAttachment[];
}
