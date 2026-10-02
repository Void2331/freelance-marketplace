import { z } from "zod";

export const reviewSchema = z.object({
  rating: z
    .number({ message: "Overall rating is required" })
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),

  communicationRating: z.number().min(1).max(5).optional(),
  qualityRating: z.number().min(1).max(5).optional(),
  deadlineRating: z.number().min(1).max(5).optional(),

  comment: z
    .string()
    .trim()
    .max(2000, "Comment cannot exceed 2000 characters")
    .optional(),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;
