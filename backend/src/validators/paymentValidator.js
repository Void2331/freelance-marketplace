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

/*
| POST /api/payments/verify
*/
const verifyPaymentSchema =
  z.object({
    reference: z
      .string({
        message: "Payment reference is required"
      })
      .trim()
      .min(
        1,
        "Payment reference is required"
      )
  });

module.exports = {
  initializePaymentSchema,
  verifyPaymentSchema
};