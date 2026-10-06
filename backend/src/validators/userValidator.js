const { z } = require("zod");

const {
  emptyToUndefined,
  optionalInt
} = require("./queryHelpers.js");

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

/*
| GET /api/users - browse/search freelancers
*/
const listFreelancersQuerySchema = z.object({
  skill: z
    .string()
    .trim()
    .max(100, "skill cannot exceed 100 characters")
    .optional(),

  search: z
    .string()
    .trim()
    .max(200, "search cannot exceed 200 characters")
    .optional(),

  minRating: z.preprocess(
    emptyToUndefined,
    z.coerce
      .number({ message: "minRating must be a number" })
      .min(0, "minRating cannot be negative")
      .max(5, "minRating cannot exceed 5")
      .optional()
  ),

  page: optionalInt({ label: "page", min: 1 }),

  limit: optionalInt({ label: "limit", min: 1, max: 50 })
});

/*
| GET /api/users/admin/all - admin user list
*/
const listAdminUsersQuerySchema = z.object({
  page: optionalInt({ label: "page", min: 1 }),

  limit: optionalInt({ label: "limit", min: 1, max: 100 }),

  role: z.preprocess(
    emptyToUndefined,
    z
      .enum(["CLIENT", "FREELANCER", "ADMIN"], {
        message: "role must be CLIENT, FREELANCER or ADMIN"
      })
      .optional()
  ),

  search: z
    .string()
    .trim()
    .max(200, "search cannot exceed 200 characters")
    .optional()
});

module.exports = {
  updateProfileSchema,
  updateUserStatusSchema,
  listFreelancersQuerySchema,
  listAdminUsersQuerySchema,
};