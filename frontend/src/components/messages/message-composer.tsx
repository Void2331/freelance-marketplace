import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSendMessage } from "@/hooks/use-messages";
import { getErrorMessage } from "@/lib/errors";
import {
  messageSchema,
  type MessageFormValues,
} from "@/lib/validations/message";

interface MessageComposerProps {
  projectId: string;
}

export function MessageComposer({ projectId }: MessageComposerProps) {
  const sendMessage = useSendMessage();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: { message: "" },
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="border-t bg-white p-3 sm:p-4"
    >
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1">
          <Textarea
            placeholder="Write a message..."
            className="min-h-11 max-h-32 resize-none"
            {...register("message")}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleSubmit(onSubmit)();
              }
            }}
          />

          <div className="mt-1 flex items-center justify-between">
            {errors.message ? (
              <p className="text-xs text-red-600">
                {errors.message.message}
              </p>
            ) : (
              <p className="text-[11px] text-zinc-400">
                Enter to send · Shift+Enter for a new line
              </p>
            )}

            <span className="text-[11px] text-zinc-400">
              5000 max
            </span>
          </div>
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
      </div>
    </form>
  );
}
