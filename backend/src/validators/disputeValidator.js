const { z } = require("zod");

const { emptyToUndefined } = require("./queryHelpers.js");

const DISPUTE_REASONS = [
  "NON_PAYMENT",
  "POOR_QUALITY",
  "SCOPE_DISAGREEMENT",
  "MISSED_DEADLINE",
  "NON_DELIVERY",
  "FRAUD",
  "OTHER",
];

const DISPUTE_STATUSES = [
  "OPEN",
  "UNDER_REVIEW",
  "AWAITING_RESPONSE",
  "RESOLVED_CLIENT",
  "RESOLVED_FREELANCER",
  "PARTIAL_RESOLUTION",
  "CLOSED",
];

const DISPUTE_DECISIONS = [
  "RESOLVED_CLIENT",
  "RESOLVED_FREELANCER",
  "PARTIAL_RESOLUTION",
];

/*
| POST /api/milestones/:milestoneId/dispute
| The reason/description messages preserve the exact strings the manual
| check used to return; an unrecognised reason value gets its own
| message instead of the "required" one.
*/
const openDisputeSchema = z.object({
  reason: z
    .string({ message: "Reason and description are required" })
    .min(1, "Reason and description are required")
    .refine((value) => DISPUTE_REASONS.includes(value), {
      message: "Invalid dispute reason",
    }),

  description: z
    .string({ message: "Reason and description are required" })
    .trim()
    .min(1, "Reason and description are required")
    .max(5000, "Description cannot exceed 5000 characters"),

  evidence: z
    .array(
      z.object({
        name: z.string().optional(),
        url: z.string().optional(),
        mimeType: z.string().optional(),
      })
    )
    .optional(),
});

/*
| PATCH /api/disputes/:disputeId/resolve
*/
const resolveDisputeSchema = z.object({
  decision: z.enum(DISPUTE_DECISIONS, {
    message: "Invalid dispute decision",
  }),

  resolution: z
    .string({ message: "Resolution explanation is required" })
    .trim()
    .min(1, "Resolution explanation is required"),
});

/*
| GET /api/disputes
*/
const listDisputesQuerySchema = z.object({
  status: z.preprocess(
    emptyToUndefined,
    z.enum(DISPUTE_STATUSES, {
      message: "status must be a valid dispute status",
    }).optional()
  ),
});

module.exports = {
  openDisputeSchema,
  resolveDisputeSchema,
  listDisputesQuerySchema,
};
