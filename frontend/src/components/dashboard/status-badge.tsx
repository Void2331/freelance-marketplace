interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<
  string,
  {
    label: string;
    className: string;
  }
> = {
  OPEN: {
    label: "Open",
    className:
      "bg-green-50 text-green-700 border-green-200",
  },

  IN_PROGRESS: {
    label: "In progress",
    className:
      "bg-blue-50 text-blue-700 border-blue-200",
  },

  COMPLETED: {
    label: "Completed",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
  },

  CANCELLED: {
    label: "Cancelled",
    className:
      "bg-red-50 text-red-700 border-red-200",
  },

  DISPUTED: {
    label: "Disputed",
    className:
      "bg-orange-50 text-orange-700 border-orange-200",
  },

  PENDING: {
    label: "Pending",
    className:
      "bg-yellow-50 text-yellow-700 border-yellow-200",
  },

  PENDING_PAYMENT: {
    label: "Pending payment",
    className:
      "bg-yellow-50 text-yellow-700 border-yellow-200",
  },

  AWAITING_PAYMENT: {
    label: "Awaiting payment",
    className:
      "bg-yellow-50 text-yellow-700 border-yellow-200",
  },

  FUNDED: {
    label: "Funded",
    className:
      "bg-blue-50 text-blue-700 border-blue-200",
  },

  ACTIVE: {
    label: "Active",
    className:
      "bg-blue-50 text-blue-700 border-blue-200",
  },

  PAUSED: {
    label: "Paused",
    className:
      "bg-orange-50 text-orange-700 border-orange-200",
  },

  SUBMITTED: {
    label: "Submitted",
    className:
      "bg-purple-50 text-purple-700 border-purple-200",
  },

  APPROVED: {
    label: "Approved",
    className:
      "bg-green-50 text-green-700 border-green-200",
  },

  RELEASED: {
    label: "Released",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
  },

  PROCESSING: {
    label: "Processing",
    className:
      "bg-blue-50 text-blue-700 border-blue-200",
  },

  SUCCESS: {
    label: "Successful",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
  },

  FAILED: {
    label: "Failed",
    className:
      "bg-red-50 text-red-700 border-red-200",
  },

  REVERSED: {
    label: "Reversed",
    className:
      "bg-orange-50 text-orange-700 border-orange-200",
  },
};

export function StatusBadge({
  status,
}: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase(),
      ),
    className:
      "bg-zinc-50 text-zinc-700 border-zinc-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}