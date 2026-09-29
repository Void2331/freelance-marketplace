import { z } from "zod";

export const jobSchema = z.object({
  title: z
    .string()
    .trim()
    .min(
      5,
      "Job title must be at least 5 characters",
    )
    .max(
      150,
      "Job title cannot exceed 150 characters",
    ),

  description: z
    .string()
    .trim()
    .min(
      20,
      "Description must be at least 20 characters",
    )
    .max(
      5000,
      "Description cannot exceed 5000 characters",
    ),

  category: z
    .string()
    .trim()
    .max(100)
    .optional(),

  skills: z
    .string()
    .optional(),

  budget: z
    .number({
      message: "Budget is required",
    })
    .positive(
      "Budget must be greater than zero",
    ),

  budgetType: z.enum([
    "FIXED",
    "HOURLY",
  ]),

  deadline: z
    .string()
    .optional(),
});

export type JobFormValues =
  z.infer<typeof jobSchema>;