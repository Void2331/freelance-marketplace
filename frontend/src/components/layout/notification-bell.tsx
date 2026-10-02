import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/use-notifications";

function timeAgo(dateString: string) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: notifications = [], isLoading } = useNotifications();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Notifications"
        onClick={() => setOpen((current) => !current)}
      >
        <Bell className="h-5 w-5" />
      </Button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border bg-white shadow-lg">
          <div className="border-b px-4 py-3">
            <h3 className="text-sm font-semibold">Notifications</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-2 p-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-10 animate-pulse rounded-lg bg-zinc-100"
                  />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <p className="p-6 text-center text-sm text-zinc-400">
                Nothing new yet.
              </p>
            ) : (
              notifications.map((notification) => {
                const project =
                  typeof notification.project === "string"
                    ? null
                    : notification.project;

                return (
                  <Link
                    key={notification._id}
                    to={project ? `/projects/${project._id}` : "#"}
                    onClick={() => setOpen(false)}
                    className="block border-b px-4 py-3 text-sm last:border-b-0 hover:bg-zinc-50"
                  >
                    <p className="text-zinc-900">{notification.message}</p>

                    <p className="mt-1 text-xs text-zinc-400">
                      {project?.title}
                      {project && " · "}
                      {timeAgo(notification.createdAt)}
                    </p>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
