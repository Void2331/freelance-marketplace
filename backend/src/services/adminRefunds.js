const axios = require("axios");

const Payment = require("../models/Payment.js");
const AppError = require("../utils/AppError");

/*
====================================================
SAFE REFUND RETRY (admin)

When a dispute is settled in the client's favour, the
freelancer's pending balance is reduced and Paystack is
asked to refund the client. If that call fails, the
payment stays REFUND_PENDING and an admin retries it here.

Paystack has no idempotency key for refunds, and a lost
response can hide a refund that DID go through. So before
creating anything we list the refunds Paystack already has
for this transaction and only ask for what is still missing.
That makes retrying safe: it can never refund twice.
====================================================
*/

const paystack = () =>
  axios.create({
    baseURL: process.env.PAYSTACK_BASE_URL || "https://api.paystack.co",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    timeout: 30000,
  });

// A failed refund is credited back to the merchant, so it does not count.
const COUNTED_STATUSES = ["pending", "processing", "processed", "needs-attention"];

/*
 * PURE FUNCTION. Decides what to do given the refunds that already
 * exist at Paystack (amounts are in kobo, like Paystack uses).
 */
const planRefund = (existingRefunds, expectedKobo) => {
  const counted = existingRefunds.filter((refund) =>
    COUNTED_STATUSES.includes(String(refund.status).toLowerCase())
  );

  const requested = counted.reduce(
    (sum, refund) => sum + Number(refund.amount || 0),
    0
  );

  const processed = counted
    .filter((refund) => String(refund.status).toLowerCase() === "processed")
    .reduce((sum, refund) => sum + Number(refund.amount || 0), 0);

  if (processed >= expectedKobo) {
    return { action: "ALREADY_REFUNDED", amountKobo: 0 };
  }

  if (requested >= expectedKobo) {
    return { action: "ALREADY_IN_PROGRESS", amountKobo: 0 };
  }

  return { action: "CREATE", amountKobo: expectedKobo - requested };
};

const retryRefund = async (paymentId, adminId) => {
  const payment = await Payment.findById(paymentId);

  if (!payment) throw new AppError("Payment not found", 404);

  if (payment.status !== "REFUND_PENDING") {
    throw new AppError(
      "Only payments waiting for a refund can be retried",
      409
    );
  }

  const refundAmount = Number(payment.metadata?.dispute?.refundAmount);

  if (!Number.isFinite(refundAmount) || refundAmount <= 0) {
    throw new AppError(
      "No refund amount was recorded for this payment. Check it in the Paystack dashboard.",
      409
    );
  }

  const expectedKobo = Math.round(refundAmount * 100);
  const client = paystack();

  // Fail closed: if we cannot see what Paystack already has, do nothing.
  let existing;

  try {
    const response = await client.get("/refund", {
      params: { reference: payment.providerReference, perPage: 50 },
    });
    existing = Array.isArray(response.data?.data) ? response.data.data : [];
  } catch (error) {
    console.error(
      "Refund lookup failed:",
      error.response?.status,
      error.response?.data?.message || error.message
    );
    throw new AppError(
      "Could not check existing refunds with Paystack. Nothing was changed. Please try again.",
      502
    );
  }

  const plan = planRefund(existing, expectedKobo);

  let outcome = plan.action;

  if (plan.action === "CREATE") {
    try {
      await client.post("/refund", {
        transaction: payment.providerReference,
        amount: plan.amountKobo,
        merchant_note: `Dispute refund for payment ${payment._id}`,
      });
    } catch (error) {
      console.error(
        "Refund retry failed:",
        error.response?.status,
        error.response?.data?.message || error.message
      );

      await Payment.updateOne(
        { _id: payment._id },
        {
          $set: {
            "metadata.refundRetry": {
              at: new Date(),
              by: adminId,
              outcome: "FAILED",
              reason: error.response?.data?.message || error.message,
            },
          },
        }
      );

      throw new AppError(
        error.response?.data?.message ||
          "Paystack rejected the refund. Check the Paystack dashboard.",
        502
      );
    }

    outcome = "REQUESTED";
  }

  const update = {
    "metadata.refundRetry": { at: new Date(), by: adminId, outcome },
  };

  // Paystack already finished it: close the payment now instead of waiting.
  if (outcome === "ALREADY_REFUNDED") {
    update.status = "REFUNDED";
    update.refundedAt = new Date();
  }

  await Payment.updateOne({ _id: payment._id }, { $set: update });

  return { outcome };
};

module.exports = { retryRefund, planRefund };
