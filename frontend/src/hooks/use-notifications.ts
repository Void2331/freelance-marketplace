import { useQuery } from "@tanstack/react-query";
import { getMyNotifications } from "@/services/notification";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => getMyNotifications(),
    // Keep the bell reasonably fresh without hammering the API.
    refetchInterval: 60000,
  });
}
