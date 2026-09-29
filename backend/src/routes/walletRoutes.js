const express =
  require("express");

const {
  getWallet
} = require("../controllers/walletController.js");

const protect =
  require("../middleware/authMiddleware.js");

const router =
  express.Router();

router.get(
  "/",
  protect,
  getWallet
);

module.exports = router;