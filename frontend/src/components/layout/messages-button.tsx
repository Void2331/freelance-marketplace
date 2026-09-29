import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useUnreadMessageCount } from "@/hooks/use-messages";

const PROJECTS_PATH_BY_ROLE: Record<string, string> = {
  CLIENT: "/client/projects",
  FREELANCER: "/freelancer/projects",
  ADMIN: "/admin/projects",
};

interface MessagesButtonProps {
  role?: string;
}

export function MessagesButton({ role }: MessagesButtonProps) {
  const { data: unreadCount = 0 } = useUnreadMessageCount();

  return (
    <Button variant="ghost" size="icon" className="relative" asChild>
      <Link
        to={PROJECTS_PATH_BY_ROLE[role ?? "CLIENT"]}
        aria-label={
          unreadCount > 0
            ? `Messages, ${unreadCount} unread`
            : "Messages"
        }
      >
        <MessageSquare className="h-5 w-5" />

        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Link>
    </Button>
  );
}
