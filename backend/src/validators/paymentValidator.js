const { z } = require("zod");

const initializePaymentSchema =
  z.object({
    milestoneId: z
      .string()
      .min(
        1,
        "Milestone ID is required"
      )
  });

module.exports = {
  initializePaymentSchema
};