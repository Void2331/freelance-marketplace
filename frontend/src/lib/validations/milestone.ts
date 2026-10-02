import { z } from "zod";

export const milestoneSchema =
  z.object({
    title: z
      .string()
      .trim()
      .min(
        3,
        "Title must be at least 3 characters",
      )
      .max(
        150,
        "Title cannot exceed 150 characters",
      ),

    description: z
      .string()
      .trim()
      .min(
        10,
        "Description must be at least 10 characters",
      )
      .max(
        2000,
        "Description cannot exceed 2000 characters",
      ),

    amount: z
      .number()
      .positive(
        "Amount must be greater than zero",
      ),

    dueDate: z
      .string()
      .min(
        1,
        "Due date is required",
      ),
  });

export const submissionSchema =
  z.object({
    message: z
      .string()
      .trim()
      .min(
        10,
        "Submission must be at least 10 characters",
      )
      .max(
        3000,
        "Submission cannot exceed 3000 characters",
      ),
  });

export type MilestoneFormValues =
  z.infer<typeof milestoneSchema>;

export type SubmissionFormValues =
  z.infer<
    typeof submissionSchema
  >;