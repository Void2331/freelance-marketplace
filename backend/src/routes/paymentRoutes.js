const express = require("express");

const {
  initializePayment,
  verifyPayment
} = require("../controllers/paymentController.js");

const {
  downloadReceipt,
  downloadMilestoneReceipt,
  downloadEarningsStatement,
} = require("../controllers/documentController.js");

const protect = require("../middleware/authMiddleware.js");
const authorize = require("../middleware/roleMiddleware.js");
const validate = require("../middleware/validateMiddleware.js");

const {
  initializePaymentSchema,
  verifyPaymentSchema
} = require("../validators/paymentValidator.js");

const router = express.Router();

router.post(
  "/initialize",
  protect,
  validate(initializePaymentSchema),
  initializePayment
);

router.post(
  "/verify",
  protect,
  validate(verifyPaymentSchema),
  verifyPayment
);

// PDF documents. Each user can only ever get their own.
router.get(
  "/receipt/milestone/:milestoneId",
  protect,
  downloadMilestoneReceipt
);

router.get("/receipt/:paymentId", protect, downloadReceipt);

router.get(
  "/earnings-statement",
  protect,
  authorize("FREELANCER"),
  downloadEarningsStatement
);

/*
  NOTE: POST /release used to live here. It duplicated
  the milestone-approval payout flow but bypassed the
  pendingBalance/availableBalance split and could never
  actually succeed. Releasing payment now happens
  exclusively through:
    POST /api/milestones/:milestoneId/approve
*/

module.exports = router;
