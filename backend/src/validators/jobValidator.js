const { z } = require("zod");

const { optionalInt } = require("./queryHelpers.js");

const milestonePlanSchema = z
  .array(
    z.object({
      title: z.string().trim().min(1, "Milestone title is required").max(100),
      description: z.string().trim().max(400).optional().default(""),
      percentage: z.coerce.number().int().min(1).max(100),
    })
  )
  .max(10, "A payment plan can have at most 10 milestones")
  .refine(
    (plan) =>
      plan.length === 0 ||
      plan.reduce((sum, item) => sum + item.percentage, 0) === 100,
    { message: "Milestone percentages must add up to 100" }
  );

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

  milestonePlan: milestonePlanSchema.optional(),
});

const updateJobSchema = createJobSchema.partial();

/*
| GET /api/jobs - public job feed query string
*/
const listJobsQuerySchema = z.object({
  page: optionalInt({ label: "page", min: 1 }),

  limit: optionalInt({ label: "limit", min: 1, max: 100 }),

  category: z
    .string()
    .trim()
    .max(100, "category cannot exceed 100 characters")
    .optional(),

  skill: z
    .string()
    .trim()
    .max(100, "skill cannot exceed 100 characters")
    .optional()
});

module.exports = {
  createJobSchema,
  updateJobSchema,
  listJobsQuerySchema,
};
