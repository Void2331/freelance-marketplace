const { z } = require("zod");

/*
| Sub-ratings are nullable because callers may explicitly send null to
| clear them; only `rating` itself is required.
*/
const subRating = (label) =>
  z.coerce
    .number({ message: `${label} must be between 1 and 5` })
    .min(1, `${label} must be between 1 and 5`)
    .max(5, `${label} must be between 1 and 5`)
    .nullish();

/*
| POST /api/projects/:projectId/review
*/
const createReviewSchema = z.object({
  rating: z.coerce
    .number({ message: "Rating must be between 1 and 5" })
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),

  communicationRating: subRating("Communication rating"),

  qualityRating: subRating("Quality rating"),

  deadlineRating: subRating("Deadline rating"),

  comment: z
    .string()
    .trim()
    .max(2000, "Comment cannot exceed 2000 characters")
    .nullish(),
});

module.exports = {
  createReviewSchema,
};
