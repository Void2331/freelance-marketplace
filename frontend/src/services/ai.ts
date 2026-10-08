import { api } from "./api";

import type { MilestonePlanItem } from "@/types/job";

export interface MilestonePlanRequest {
  title: string;
  description: string;
  budget: number;
  deadline?: string;
}

interface MilestonePlanResponse {
  success: boolean;
  data: {
    milestones: MilestonePlanItem[];
  };
}

export async function suggestMilestonePlan(
  payload: MilestonePlanRequest,
): Promise<MilestonePlanItem[]> {
  const response = await api.post<MilestonePlanResponse>(
    "/ai/milestone-plan",
    payload,
    // The AI can take a while; the default 15s is too short.
    { timeout: 60000 },
  );

  return response.data.data.milestones;
}
