const { z } = require("zod");

const sendMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(5000, "Message cannot exceed 5000 characters"),

  attachments: z
    .array(
      z.object({
        name: z.string().optional(),
        url: z.string(),
        mimeType: z.string().optional(),
        size: z.number().optional(),
      })
    )
    .optional(),
});

module.exports = {
  sendMessageSchema,
};
