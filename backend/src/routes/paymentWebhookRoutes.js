const express = require("express");

const router = express.Router();

const {
  handlePaystackWebhook,
} = require("../controllers/paymentWebhookController.js");

router.post(
  "/paystack",
  handlePaystackWebhook
);

module.exports = router;