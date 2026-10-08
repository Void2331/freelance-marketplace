import { useMutation } from "@tanstack/react-query";

import { suggestMilestonePlan } from "@/services/ai";

export function useSuggestMilestonePlan() {
  return useMutation({
    mutationFn: suggestMilestonePlan,
  });
}
