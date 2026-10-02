import { useEffect } from "react";
import { ArrowLeft, Loader2, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-context";
import {
  useMarkMessagesRead,
  useProjectMessages,
} from "@/hooks/use-messages";
import type { MessageConversation } from "@/types/message";
import { MessageBubble } from "./message-bubble";
import { MessageComposer } from "./message-composer";

interface ConversationPanelProps {
  conversation: MessageConversation;
  onBack?: () => void;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function ConversationPanel({
  conversation,
  onBack,
}: ConversationPanelProps) {
  const { user } = useAuth();
  const {
    data: messages = [],
    isLoading,
    isError,
  } = useProjectMessages(conversation.projectId);
  const markRead = useMarkMessagesRead();

  useEffect(() => {
    if (conversation.unreadCount > 0) {
      markRead.mutate(conversation.projectId);
    }
    // Mark this conversation read once when the selected project changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.projectId]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-center gap-3 border-b bg-white px-4 py-3 sm:px-5">
        {onBack && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onBack}
            aria-label="Back to conversations"
            className="shrink-0 lg:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}

        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-900 text-xs font-semibold text-white">
          {conversation.participant.avatar ? (
            <img
              src={conversation.participant.avatar}
              alt={conversation.participant.name}
              className="h-full w-full object-cover"
            />
          ) : (
            initials(conversation.participant.name)
          )}
        </div>

        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-zinc-950">
            {conversation.participant.name}
          </h2>
          <p className="truncate text-xs text-zinc-500">
            {conversation.projectTitle}
          </p>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto bg-zinc-50 px-4 py-5 sm:px-6">
        {isLoading ? (
          <div className="flex h-full min-h-[300px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          </div>
        ) : isError ? (
          <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-zinc-700">
              Unable to load messages
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              Please try again in a moment.
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center">
            <MessageCircle className="h-8 w-8 text-zinc-300" />
            <p className="mt-3 text-sm font-medium text-zinc-700">
              Start the conversation
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              Send the first message for this project below.
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-3">
            {messages.map((message) => (
              <MessageBubble
                key={message._id}
                message={message}
                currentUser={user}
              />
            ))}
          </div>
        )}
      </div>

      <MessageComposer projectId={conversation.projectId} />
    </div>
  );
}
