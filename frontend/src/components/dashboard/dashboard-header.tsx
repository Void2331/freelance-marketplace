import type { ReactNode } from "react";

interface DashboardHeaderProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function DashboardHeader({
  title,
  description,
  action,
}: DashboardHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h1>

        <p className="mt-1 text-sm text-zinc-500 sm:text-base">
          {description}
        </p>
      </div>

      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}