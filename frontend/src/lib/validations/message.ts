import { z } from "zod";

export const messageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(5000, "Message cannot exceed 5000 characters"),
});

export type MessageFormValues = z.infer<typeof messageSchema>;
