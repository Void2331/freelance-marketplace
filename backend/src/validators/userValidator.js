const { z } = require("zod");

const updateProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters")
      .optional(),

    avatar: z
      .string()
      .trim()
      .max(1000, "Avatar URL cannot exceed 1000 characters")
      .optional(),

    bio: z
      .string()
      .trim()
      .max(1000, "Bio cannot exceed 1000 characters")
      .optional(),

    location: z
      .string()
      .trim()
      .max(150, "Location cannot exceed 150 characters")
      .optional(),

    skills: z
      .array(z.string().trim())
      .optional(),

    hourlyRate: z
      .coerce
      .number()
      .min(0, "Hourly rate cannot be negative")
      .optional(),
  })
  .strict();

const updateUserStatusSchema = z.object({
  isActive: z.boolean({
    message: "isActive must be true or false",
  }),
});

module.exports = {
  updateProfileSchema,
  updateUserStatusSchema,
};