const { z } = require("zod");

const milestonePlanRequestSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Job title must be at least 5 characters")
    .max(150, "Job title cannot exceed 150 characters"),

  description: z
    .string()
    .trim()
    .min(20, "Add a longer description (at least 20 characters) so the AI has something to work with")
    .max(5000, "Job description cannot exceed 5000 characters"),

  budget: z.coerce.number().positive("Budget must be greater than zero"),

  currency: z.string().trim().max(10).optional(),

  deadline: z.string().trim().max(40).optional(),
});

module.exports = { milestonePlanRequestSchema };
