const { z } = require("zod");

const { emptyToUndefined } = require("./queryHelpers.js");

/*
| GET /api/notifications
*/
const listNotificationsQuerySchema = z.object({
  limit: z.preprocess(
    emptyToUndefined,
    z.coerce
      .number({ message: "limit must be a number" })
      .int("limit must be an integer")
      .min(1, "limit must be at least 1")
      .max(50, "limit cannot exceed 50")
      .optional()
  )
});

module.exports = {
  listNotificationsQuerySchema,
};
