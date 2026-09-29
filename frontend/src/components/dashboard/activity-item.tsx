import type { LucideIcon } from "lucide-react";

interface ActivityItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
  time: string;
}

export function ActivityItem({
  icon: Icon,
  title,
  description,
  time,
}: ActivityItemProps) {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100">
        <Icon className="h-4 w-4 text-zinc-600" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-zinc-500">
          {description}
        </p>
      </div>

      <time className="shrink-0 text-xs text-zinc-400">
        {time}
      </time>
    </div>
  );
}