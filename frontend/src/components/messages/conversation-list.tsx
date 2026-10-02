import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import type { MessageConversation } from "@/types/message";
import { ConversationListItem } from "./conversation-list-item";

interface ConversationListProps {
  conversations: MessageConversation[];
  selectedProjectId?: string;
  onSelect: (projectId: string) => void;
}

export function ConversationList({
  conversations,
  selectedProjectId,
  onSelect,
}: ConversationListProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return conversations;

    return conversations.filter((conversation) =>
      [
        conversation.projectTitle,
        conversation.participant.name,
        conversation.lastMessage?.message ?? "",
      ].some((value) =>
        value.toLowerCase().includes(term),
      ),
    );
  }, [conversations, search]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search conversations"
            className="h-10 w-full rounded-lg border bg-zinc-50 pl-9 pr-3 text-sm outline-none transition focus:border-zinc-400 focus:bg-white"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-zinc-700">
              {search ? "No conversations found" : "No conversations yet"}
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              {search
                ? "Try a different name or project title."
                : "Messages from your projects will appear here."}
            </p>
          </div>
        ) : (
          filtered.map((conversation) => (
            <ConversationListItem
              key={conversation.projectId}
              conversation={conversation}
              selected={
                conversation.projectId === selectedProjectId
              }
              onClick={() => onSelect(conversation.projectId)}
            />
          ))
        )}
      </div>
    </div>
  );
}
