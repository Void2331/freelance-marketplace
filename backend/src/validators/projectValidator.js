const { z } = require("zod");

const updateProjectSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Project title must be at least 3 characters")
    .max(150, "Project title cannot exceed 150 characters")
    .optional(),

  description: z
    .string()
    .trim()
    .min(10, "Project description must be at least 10 characters")
    .max(5000, "Project description cannot exceed 5000 characters")
    .optional()
});

module.exports = {
  updateProjectSchema
};