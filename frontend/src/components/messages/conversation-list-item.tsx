import type { MessageConversation } from "@/types/message";

interface ConversationListItemProps {
  conversation: MessageConversation;
  selected: boolean;
  onClick: () => void;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function ConversationListItem({
  conversation,
  selected,
  onClick,
}: ConversationListItemProps) {
  const preview = conversation.lastMessage?.message ?? "No messages yet";
  const time = conversation.lastMessage?.createdAt
    ? new Date(conversation.lastMessage.createdAt).toLocaleDateString([], {
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full border-b px-4 py-3 text-left transition-colors ${
        selected
          ? "bg-zinc-100"
          : "hover:bg-zinc-50"
      }`}
    >
      <div className="flex items-start gap-3">
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

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-zinc-950">
              {conversation.participant.name}
            </p>
            <span className="shrink-0 text-[10px] text-zinc-400">
              {time}
            </span>
          </div>

          <p className="mt-0.5 truncate text-xs font-medium text-zinc-500">
            {conversation.projectTitle}
          </p>

          <div className="mt-1 flex items-center gap-2">
            <p
              className={`min-w-0 flex-1 truncate text-xs ${
                conversation.unreadCount > 0
                  ? "font-semibold text-zinc-800"
                  : "text-zinc-500"
              }`}
            >
              {preview}
            </p>

            {conversation.unreadCount > 0 && (
              <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-zinc-950 px-1.5 text-[10px] font-semibold text-white">
                {conversation.unreadCount > 99
                  ? "99+"
                  : conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
