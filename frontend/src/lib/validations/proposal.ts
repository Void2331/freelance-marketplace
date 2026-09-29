import { z } from "zod";

export const proposalSchema =
  z.object({
    coverLetter: z
      .string()
      .trim()
      .min(
        20,
        "Cover letter must be at least 20 characters",
      )
      .max(
        3000,
        "Cover letter cannot exceed 3000 characters",
      ),

    bidAmount: z
      .number({
        message: "Bid amount is required",
      })
      .positive(
        "Bid amount must be greater than zero",
      ),

    estimatedDuration: z
      .number({
        message:
          "Estimated duration is required",
      })
      .int(
        "Duration must be a whole number",
      )
      .positive(
        "Duration must be greater than zero",
      ),
  });

export type ProposalFormValues =
  z.infer<typeof proposalSchema>;