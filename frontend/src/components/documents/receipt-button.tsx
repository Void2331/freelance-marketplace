import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import {
  downloadErrorMessage,
  downloadMilestoneReceipt,
} from "@/services/documents";

import type { Milestone, MilestoneStatus } from "@/types/milestone";
import type { UserRole } from "@/types/auth";

// Money has been paid in, so the client can have a receipt.
const PAID: MilestoneStatus[] = [
  "FUNDED",
  "IN_PROGRESS",
  "SUBMITTED",
  "REVISION_REQUESTED",
  "APPROVED",
  "RELEASED",
  "DISPUTED",
  "REFUNDED",
];

interface ReceiptButtonProps {
  milestone: Milestone;
  role: UserRole;
}

export function ReceiptButton({ milestone, role }: ReceiptButtonProps) {
  const [loading, setLoading] = useState(false);

  const isClient = role === "CLIENT" && PAID.includes(milestone.status);
  const isFreelancer = role === "FREELANCER" && milestone.status === "RELEASED";

  if (!isClient && !isFreelancer) return null;

  const label = isClient ? "Download receipt" : "Download earnings statement";

  async function handleDownload() {
    setLoading(true);

    try {
      await downloadMilestoneReceipt(
        milestone._id,
        `${isClient ? "receipt" : "earnings-statement"}-${milestone._id.slice(-6)}.pdf`,
      );
    } catch (error) {
      toast.error(await downloadErrorMessage(error, "Unable to download the document"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      {label}
    </Button>
  );
}
