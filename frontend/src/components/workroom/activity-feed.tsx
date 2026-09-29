import { Activity } from "lucide-react";

import { SectionCard } from "@/components/dashboard/section-card";
import { ActivityItem } from "@/components/dashboard/activity-item";

import type { ProjectActivity } from "@/types/project";

interface ActivityFeedProps {
  activities: ProjectActivity[];
}

function timeAgo(dateString: string) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <SectionCard
      title="Activity"
      description="Everything that's happened on this project"
    >
      {activities.length === 0 ? (
        <p className="text-center text-sm text-zinc-400">
          No activity yet.
        </p>
      ) : (
        <div className="space-y-5">
          {activities.map((activity) => (
            <ActivityItem
              key={activity._id}
              icon={Activity}
              title={activity.message}
              description={activity.user?.name ?? "System"}
              time={timeAgo(activity.createdAt)}
            />
          ))}
        </div>
      )}
    </SectionCard>
  );
}
