import { useEffect } from "react";
import { Loader2, MessageSquare } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { ConversationList } from "@/components/messages/conversation-list";
import { ConversationPanel } from "@/components/messages/conversation-panel";
import { MessageEmptyState } from "@/components/messages/message-empty-state";
import { useMessageConversations } from "@/hooks/use-messages";

export default function Messages() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedProjectId = searchParams.get("projectId") ?? undefined;

  const {
    data: conversations = [],
    isLoading,
    isError,
  } = useMessageConversations();

  const selectedConversation = conversations.find(
    (conversation) =>
      conversation.projectId === selectedProjectId,
  );

  useEffect(() => {
    if (isLoading || isError) return;

    if (conversations.length === 0) {
      if (selectedProjectId) {
        setSearchParams({}, { replace: true });
      }
      return;
    }

    if (!selectedConversation) {
      setSearchParams(
        { projectId: conversations[0].projectId },
        { replace: true },
      );
    }
  }, [
    conversations,
    isError,
    isLoading,
    selectedConversation,
    selectedProjectId,
    setSearchParams,
  ]);

  function selectConversation(projectId: string) {
    setSearchParams({ projectId });
  }

  function clearSelection() {
    setSearchParams({}, { replace: true });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="rounded-xl border bg-white p-10 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-zinc-300" />
          <h1 className="mt-4 text-lg font-semibold text-zinc-900">
            Unable to load messages
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Please refresh the page and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
          Messages
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Communicate with clients and freelancers working on your projects.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="grid h-[calc(100vh-220px)] min-h-[560px] lg:grid-cols-[340px_1fr]">
          <aside
            className={`min-h-0 border-r ${
              selectedConversation ? "hidden lg:block" : "block"
            }`}
          >
            <ConversationList
              conversations={conversations}
              selectedProjectId={selectedProjectId}
              onSelect={selectConversation}
            />
          </aside>

          <section
            className={`min-h-0 ${
              selectedConversation ? "block" : "hidden lg:block"
            }`}
          >
            {selectedConversation ? (
              <ConversationPanel
                conversation={selectedConversation}
                onBack={clearSelection}
              />
            ) : (
              <MessageEmptyState />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
