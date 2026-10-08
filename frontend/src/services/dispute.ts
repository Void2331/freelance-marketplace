import { api } from "./api";

import type {
  Dispute,
  DisputeBrief,
  DisputeDecision,
  OpenDisputeRequest,
} from "@/types/dispute";

interface OpenDisputeResponse {
  success: boolean;
  message: string;
}

export async function openDispute(
  milestoneId: string,
  data: OpenDisputeRequest,
): Promise<void> {
  await api.post<OpenDisputeResponse>(
    `/milestones/${milestoneId}/dispute`,
    data,
  );
}

export async function resolveDispute(
  disputeId: string,
  decision: DisputeDecision,
  resolution: string,
  freelancerPercent?: number,
): Promise<void> {
  await api.patch<OpenDisputeResponse>(`/disputes/${disputeId}/resolve`, {
    decision,
    resolution,
    freelancerPercent,
  });
}

interface DisputesResponse {
  success: boolean;
  data: { disputes: Dispute[] };
}

// Admin only.
export async function listDisputes(status?: string): Promise<Dispute[]> {
  const response = await api.get<DisputesResponse>("/disputes", {
    params: status ? { status } : undefined,
  });
  return response.data.data.disputes;
}

export async function getProjectDisputes(
  projectId: string,
): Promise<Dispute[]> {
  const response = await api.get<DisputesResponse>(
    `/projects/${projectId}/disputes`,
  );
  return response.data.data.disputes;
}

// Admin only. Generates (or regenerates) the AI case briefing.
export async function generateDisputeBrief(
  disputeId: string,
): Promise<DisputeBrief> {
  const response = await api.post<{
    success: boolean;
    data: { brief: DisputeBrief };
  }>(
    `/disputes/${disputeId}/brief`,
    {},
    // The AI can take a while; the default 15s is too short.
    { timeout: 60000 },
  );

  return response.data.data.brief;
}
