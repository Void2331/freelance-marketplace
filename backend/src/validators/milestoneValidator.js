const { z } = require("zod");

const createMilestoneSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Milestone title must be at least 3 characters")
    .max(150, "Milestone title cannot exceed 150 characters"),

  description: z
    .string()
    .trim()
    .min(10, "Milestone description must be at least 10 characters")
    .max(2000, "Milestone description cannot exceed 2000 characters"),

  amount: z
    .number({
      message: "Milestone amount must be a number"
    })
    .positive("Milestone amount must be greater than zero"),

  dueDate: z
    .string()
    .datetime("Due date must be a valid date")
});

const updateMilestoneSchema =
  createMilestoneSchema.partial();

const submitMilestoneSchema = z.object({
  message: z
    .string({ message: "Submission message is required" })
    .trim()
    .min(1, "Submission message is required")
    .max(
      5000,
      "Submission message cannot exceed 5000 characters"
    ),

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

/*
| POST /api/milestones/:milestoneId/request-changes
*/
const requestChangesSchema = z.object({
  message: z
    .string({ message: "Please explain what needs to be changed" })
    .trim()
    .min(1, "Please explain what needs to be changed")
    .max(
      5000,
      "Message cannot exceed 5000 characters"
    ),
});

module.exports = {
  createMilestoneSchema,
  updateMilestoneSchema,
  submitMilestoneSchema,
  requestChangesSchema,
};