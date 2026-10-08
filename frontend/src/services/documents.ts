import { isAxiosError } from "axios";

import { api } from "./api";

import { getErrorMessage } from "@/lib/errors";

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  // give the browser a moment to start the download first
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

async function downloadPdf(
  path: string,
  filename: string,
  params?: Record<string, string>,
) {
  const response = await api.get<Blob>(path, {
    params,
    responseType: "blob",
    timeout: 60000,
  });

  saveBlob(response.data, filename);
}

/*
 * Client: receipt. Freelancer: earnings statement. Looked up by
 * milestone because that is what the workroom has; the server finds
 * the payment that really received the money.
 */
export function downloadMilestoneReceipt(milestoneId: string, filename: string) {
  return downloadPdf(`/payments/receipt/milestone/${milestoneId}`, filename);
}

/* Freelancer: everything earned between two dates (YYYY-MM-DD). */
export function downloadEarningsStatement(from: string, to: string) {
  return downloadPdf(
    "/payments/earnings-statement",
    `earnings-statement-${from}-to-${to}.pdf`,
    { from, to },
  );
}

/*
 * Because the request asks for a file, an error message from the server
 * arrives as a Blob. Read it so people see the real reason.
 */
export async function downloadErrorMessage(
  error: unknown,
  fallback: string,
): Promise<string> {
  if (isAxiosError(error) && error.response?.data instanceof Blob) {
    try {
      const body = JSON.parse(await error.response.data.text());

      if (typeof body.message === "string" && body.message) {
        return body.message;
      }
    } catch {
      // not JSON: fall through to the fallback
    }

    return fallback;
  }

  return getErrorMessage(error, fallback);
}
