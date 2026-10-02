import { useEffect } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "@/features/auth/auth-context";
import {
  useMarkMessagesRead,
  useProjectMessages,
} from "@/hooks/use-messages";
import { MessageBubble } from "@/components/messages/message-bubble";
import { MessageComposer } from "@/components/messages/message-composer";

interface MessageThreadProps {
  projectId: string;
}

export function MessageThread({ projectId }: MessageThreadProps) {
  const { user } = useAuth();
  const { data: messages = [], isLoading } = useProjectMessages(projectId);
  const markRead = useMarkMessagesRead();

  useEffect(() => {
    markRead.mutate(projectId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
        <div>
          <h2 className="font-semibold">Messages</h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Conversation for this project
          </p>
        </div>

        <Link
          to={`/messages?projectId=${projectId}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-950"
        >
          Open full conversation
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="max-h-96 space-y-3 overflow-y-auto bg-zinc-50 p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-12 animate-pulse rounded-lg bg-zinc-200"
              />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-400">
            No messages yet. Say hello!
          </p>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message._id}
              message={message}
              currentUser={user}
            />
          ))
        )}
      </div>

      <MessageComposer projectId={projectId} />
    </div>
  );
}
