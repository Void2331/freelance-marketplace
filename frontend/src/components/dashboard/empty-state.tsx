import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
        <Icon className="h-5 w-5 text-zinc-500" />
      </div>

      <h3 className="mt-4 font-semibold">
        {title}
      </h3>

      <p className="mt-1 max-w-sm text-sm text-zinc-500">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button
          className="mt-5"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}