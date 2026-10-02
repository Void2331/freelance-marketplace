const express = require("express");

const {
  initializePayment,
  verifyPayment
} = require("../controllers/paymentController.js");

const protect = require("../middleware/authMiddleware.js");
const validate = require("../middleware/validateMiddleware.js");

const {
  initializePaymentSchema
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
  verifyPayment
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
