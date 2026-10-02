import { z } from "zod";

export const disputeSchema = z.object({
  reason: z.enum([
    "NON_PAYMENT",
    "POOR_QUALITY",
    "SCOPE_DISAGREEMENT",
    "MISSED_DEADLINE",
    "NON_DELIVERY",
    "FRAUD",
    "OTHER",
  ]),

  description: z
    .string()
    .trim()
    .min(20, "Please describe the issue in at least 20 characters")
    .max(5000, "Description cannot exceed 5000 characters"),
});

export type DisputeFormValues = z.infer<typeof disputeSchema>;
