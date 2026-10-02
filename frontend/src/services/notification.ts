import { api } from "./api";
import type { Notification } from "@/types/notification";

interface NotificationsResponse {
  success: boolean;
  data: { notifications: Notification[] };
}

export async function getMyNotifications(
  limit = 15,
): Promise<Notification[]> {
  const response = await api.get<NotificationsResponse>("/notifications", {
    params: { limit },
  });
  return response.data.data.notifications;
}
