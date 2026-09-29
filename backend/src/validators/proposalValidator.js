const { z } = require("zod");

const createProposalSchema = z.object({
  coverLetter: z
    .string()
    .trim()
    .min(20, "Cover letter must be at least 20 characters")
    .max(3000, "Cover letter cannot exceed 3000 characters"),

  bidAmount: z.coerce
    .number()
    .positive("Bid amount must be greater than zero"),

  estimatedDuration: z.coerce
    .number()
    .int("Estimated duration must be a whole number")
    .positive("Estimated duration must be greater than zero")
});

module.exports = {
  createProposalSchema
};