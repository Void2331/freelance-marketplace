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
  submission: z
    .string()
    .trim()
    .min(
      10,
      "Submission must be at least 10 characters"
    )
    .max(
      3000,
      "Submission cannot exceed 3000 characters"
    )
});

module.exports = {
  createMilestoneSchema,
  updateMilestoneSchema,
  submitMilestoneSchema
};