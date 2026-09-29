interface StatusBadgeProps {
  status: string;
}

const statusStyles: Record<string, string> = {
  OPEN:
    "bg-green-50 text-green-700 border-green-200",

  IN_PROGRESS:
    "bg-blue-50 text-blue-700 border-blue-200",

  COMPLETED:
    "bg-emerald-50 text-emerald-700 border-emerald-200",

  CANCELLED:
    "bg-red-50 text-red-700 border-red-200",

  DISPUTED:
    "bg-orange-50 text-orange-700 border-orange-200",

  PENDING:
    "bg-yellow-50 text-yellow-700 border-yellow-200",

  AWAITING_PAYMENT:
    "bg-yellow-50 text-yellow-700 border-yellow-200",

  FUNDED:
    "bg-blue-50 text-blue-700 border-blue-200",

  SUBMITTED:
    "bg-purple-50 text-purple-700 border-purple-200",

  APPROVED:
    "bg-green-50 text-green-700 border-green-200",

  RELEASED:
    "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function StatusBadge({
  status,
}: StatusBadgeProps) {
  const style =
    statusStyles[status] ??
    "bg-zinc-50 text-zinc-700 border-zinc-200";

  const label = status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${style}`}
    >
      {label}
    </span>
  );
}