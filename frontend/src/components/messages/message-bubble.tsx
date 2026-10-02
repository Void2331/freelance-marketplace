import { CheckCheck } from "lucide-react";

import type { AuthUser } from "@/types/auth";
import type { Message } from "@/types/message";

interface MessageBubbleProps {
  message: Message;
  currentUser: AuthUser | null;
}

function getUserId(user: string | { _id: string }) {
  return typeof user === "string" ? user : user._id;
}

export function MessageBubble({
  message,
  currentUser,
}: MessageBubbleProps) {
  const isMine =
    Boolean(currentUser?._id) &&
    getUserId(message.sender) === currentUser?._id;

  const senderName =
    typeof message.sender === "string"
      ? ""
      : message.sender.name;

  return (
    <div
      className={`flex ${
        isMine ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm shadow-sm sm:max-w-[72%] ${
          isMine
            ? "rounded-br-md bg-zinc-950 text-white"
            : "rounded-bl-md bg-zinc-100 text-zinc-900"
        }`}
      >
        {!isMine && senderName && (
          <p className="mb-1 text-xs font-semibold text-zinc-500">
            {senderName}
          </p>
        )}

        <p className="whitespace-pre-wrap break-words leading-5">
          {message.message}
        </p>

        {message.attachments.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {message.attachments.map((attachment, index) => (
              <a
                key={`${attachment.url}-${index}`}
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                className={`block truncate rounded-md px-2 py-1.5 text-xs underline ${
                  isMine
                    ? "bg-white/10 text-white"
                    : "bg-white text-zinc-700"
                }`}
              >
                {attachment.name ?? "Attachment"}
              </a>
            ))}
          </div>
        )}

        <div
          className={`mt-1.5 flex items-center justify-end gap-1 text-[10px] ${
            isMine ? "text-zinc-300" : "text-zinc-400"
          }`}
        >
          <span>
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
          {isMine && message.readAt && (
            <CheckCheck className="h-3 w-3" />
          )}
        </div>
      </div>
    </div>
  );
}
