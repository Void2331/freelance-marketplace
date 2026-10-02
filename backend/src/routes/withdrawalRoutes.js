const express = require("express");

const protect = require("../middleware/authMiddleware.js");
const authorize = require("../middleware/roleMiddleware.js");
const validate = require("../middleware/validateMiddleware.js");

const {
  getBanks,
  setupWithdrawalAccount,
  getWithdrawalAccount,
  requestWithdrawal,
  listWithdrawals,
} = require("../controllers/withdrawalController.js");

const {
  setupWithdrawalAccountSchema,
  requestWithdrawalSchema,
} = require("../validators/withdrawalValidator.js");

const router = express.Router();

router.get("/banks", protect, getBanks);

router
  .route("/withdrawal-account")
  .get(protect, authorize("FREELANCER"), getWithdrawalAccount)
  .post(
    protect,
    authorize("FREELANCER"),
    validate(setupWithdrawalAccountSchema),
    setupWithdrawalAccount
  );

router.post(
  "/withdraw",
  protect,
  authorize("FREELANCER"),
  validate(requestWithdrawalSchema),
  requestWithdrawal
);

router.get(
  "/withdrawals",
  protect,
  authorize("FREELANCER"),
  listWithdrawals
);

module.exports = router;
