import { api } from "./api";

import type {
  InitializePaymentResponse,
  PaymentVerification,
} from "@/types/payment";

interface InitializeResponse {
  success: boolean;
  message: string;
  data: InitializePaymentResponse;
}

interface VerifyResponse {
  success: boolean;
  message: string;
  data: PaymentVerification;
}

export async function initializePayment(
  milestoneId: string,
): Promise<InitializePaymentResponse> {
  const response =
    await api.post<InitializeResponse>(
      "/payments/initialize",
      {
        milestoneId,
      },
    );

  return response.data.data;
}

export async function verifyPayment(
  reference: string,
): Promise<PaymentVerification> {
  const response =
    await api.post<VerifyResponse>(
      "/payments/verify",
      {
        reference,
      },
    );

  return response.data.data;
}