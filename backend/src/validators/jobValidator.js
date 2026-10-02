const { z } = require("zod");

const createJobSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Job title must be at least 5 characters")
    .max(150, "Job title cannot exceed 150 characters"),

  description: z
    .string()
    .trim()
    .min(20, "Job description must be at least 20 characters")
    .max(5000, "Job description cannot exceed 5000 characters"),

  category: z.string().trim().max(100).optional(),

  skills: z.array(z.string().trim()).optional(),

  budget: z.coerce
    .number()
    .positive("Budget must be greater than zero"),

  budgetType: z.enum(["FIXED", "HOURLY"]).optional(),

  deadline: z
    .string()
    .datetime("Deadline must be a valid date")
    .optional(),
});

const updateJobSchema = createJobSchema.partial();

module.exports = {
  createJobSchema,
  updateJobSchema,
};
