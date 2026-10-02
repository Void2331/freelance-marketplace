const asyncHandler = require("../utils/asyncHandler");
const paymentService = require("../services/payment.js");

const initializePayment = asyncHandler(
  async (req, res) => {
    const { milestoneId } = req.body;

    const result =
      await paymentService.initializeMilestonePayment(
        {
          milestoneId,
          clientId: req.user._id
        }
      );

    res.status(200).json({
      success: true,
      message:
        "Payment initialized successfully",
      data: result
    });
  }
);

const verifyPayment =
  asyncHandler(
    async (req, res) => {
      const { reference } =
        req.body;

      const payment =
        await paymentService.verifyPayment(
          reference
        );

      res.status(200).json({
        success: true,
        message:
          "Payment verified successfully",
        data: {
          payment
        }
      });
    }
  );

/*
  NOTE: this file previously also exported
  releasePayment, a second "release a milestone's
  payment" path that bypassed the wallet's
  pendingBalance/availableBalance split entirely and
  gated on a milestone status ("APPROVED") that
  nothing in the app ever sets - it could never
  succeed. Releasing payment happens through
  POST /api/milestones/:milestoneId/approve
  (milestoneApprovalController.js), which does the
  full pending->available transfer atomically.
*/

module.exports = {
  initializePayment,
  verifyPayment
};