const express = require("express");
const rateLimit = require("express-rate-limit");

const protect = require("../middleware/authMiddleware.js");
const authorize = require("../middleware/roleMiddleware.js");

const {
  getStats,
  listPayments,
  listWithdrawals,
  retryPaymentRefund,
} = require("../controllers/adminController.js");

const router = express.Router();

// Everything here is admin only.
router.use(protect, authorize("ADMIN"));

// Retrying moves real money, so keep it slow and deliberate.
const refundLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => String(req.user._id),
  message: {
    success: false,
    message: "Too many refund attempts this hour. Please try again later.",
  },
});

router.get("/stats", getStats);
router.get("/payments", listPayments);
router.get("/withdrawals", listWithdrawals);

router.post(
  "/payments/:paymentId/retry-refund",
  refundLimiter,
  retryPaymentRefund
);

module.exports = router;
