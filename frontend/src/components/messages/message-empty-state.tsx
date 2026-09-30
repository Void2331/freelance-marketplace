import { MessageCircle } from "lucide-react";

export function MessageEmptyState() {
  return (
    <div className="flex h-full min-h-[420px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100">
        <MessageCircle className="h-7 w-7 text-zinc-500" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-zinc-900">
        Select a conversation
      </h2>
      <p className="mt-1 max-w-sm text-sm text-zinc-500">
        Choose a project conversation from the list to view messages and reply.
      </p>
    </div>
  );
}
