const express = require("express");

const protect = require("../middleware/authMiddleware.js");
const authorize = require("../middleware/roleMiddleware.js");

const {
  getMyWalletTransactions,
} = require("../controllers/walletTransactionController.js");

const router = express.Router();

router.get(
  "/transactions",
  protect,
  authorize("FREELANCER"),
  getMyWalletTransactions
);

module.exports = router;