import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { useEffect } from "react";
import {
  useMarkMessagesRead,
  useProjectMessages,
  useSendMessage,
} from "@/hooks/use-messages";
import { messageSchema, type MessageFormValues } from "@/lib/validations/message";

import type { AuthUser } from "@/types/auth";
import { getErrorMessage } from "@/lib/errors";

interface MessageThreadProps {
  projectId: string;
  currentUser: AuthUser | null;
}

export function MessageThread({
  projectId,
  currentUser,
}: MessageThreadProps) {
  const { data: messages = [], isLoading } = useProjectMessages(projectId);
  const sendMessage = useSendMessage();
  const markRead = useMarkMessagesRead();

  // Opening the thread clears any unread messages for this project.
  useEffect(() => {
    if (projectId) markRead.mutate(projectId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
  });

  async function onSubmit(values: MessageFormValues) {
    try {
      await sendMessage.mutateAsync({
        projectId,
        data: { message: values.message },
      });

      reset();
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Unable to send message"),
      );
    }
  }

  return (
    <div className="flex flex-col rounded-xl border bg-white shadow-sm">
      <div className="border-b px-5 py-4">
        <h2 className="font-semibold">Messages</h2>
        <p className="mt-0.5 text-xs text-zinc-500">
          Conversation for this project
        </p>
      </div>

      <div className="max-h-96 space-y-4 overflow-y-auto p-5">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-12 animate-pulse rounded-lg bg-zinc-100"
              />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-zinc-400">
            No messages yet. Say hello!
          </p>
        ) : (
          messages.map((message) => {
            const sender =
              typeof message.sender === "string" ? null : message.sender;

            const isMine = sender?._id === currentUser?._id;

            return (
              <div
                key={message._id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    isMine
                      ? "bg-zinc-950 text-white"
                      : "bg-zinc-100 text-zinc-900"
                  }`}
                >
                  {!isMine && sender?.name && (
                    <p className="mb-0.5 text-xs font-semibold text-zinc-500">
                      {sender.name}
                    </p>
                  )}

                  <p className="whitespace-pre-wrap leading-5">
                    {message.message}
                  </p>

                  <p
                    className={`mt-1 text-[10px] ${
                      isMine ? "text-zinc-300" : "text-zinc-400"
                    }`}
                  >
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex items-end gap-2 border-t p-4"
      >
        <div className="flex-1">
          <Textarea
            placeholder="Write a message..."
            className="min-h-11"
            {...register("message")}
          />

          {errors.message && (
            <p className="mt-1 text-xs text-red-600">
              {errors.message.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="icon"
          disabled={sendMessage.isPending}
          aria-label="Send message"
        >
          {sendMessage.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
