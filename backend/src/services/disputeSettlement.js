const axios = require("axios");

const Payment = require("../models/Payment.js");
const Milestone = require("../models/milestone.js");
const Project = require("../models/project.js");
const Dispute = require("../models/Dispute.js");
const AppError = require("../utils/AppError");

const {
  round2,
  releasePendingToAvailable,
  removeFromPending,
} = require("./fundsRelease.js");

const {
  checkProjectCompletion,
} = require("./projectCompletion.js");

const paystack = axios.create({
  baseURL:
    process.env.PAYSTACK_BASE_URL || "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

/*
====================================================
SETTLE DISPUTE FUNDS (runs inside the caller's
transaction)

RESOLVED_FREELANCER -> full net amount released
RESOLVED_CLIENT     -> full amount refunded to client
PARTIAL_RESOLUTION  -> freelancerPercent (1-99) of
                       the money goes to the freelancer,
                       the rest is refunded

Returns { payment, refundAmount } so the caller can
trigger the Paystack refund AFTER the commit.
====================================================
*/
const settleDisputeFunds = async ({
  dispute,
  decision,
  freelancerPercent,
  session,
}) => {
  const milestone = await Milestone.findById(
    dispute.milestone
  ).session(session);

  if (!milestone) {
    throw new AppError("Milestone not found", 404);
  }

  const payment = await Payment.findOne({
    milestone: milestone._id,
    status: "FUNDED",
  }).session(session);

  // Disputed before any money was paid in: nothing to move.
  if (!payment) {
    milestone.status = "CANCELLED";
    await milestone.save({ session });

    return { payment: null, refundAmount: 0 };
  }

  const net =
    payment.freelancerNetAmount || payment.amount;

  const grossPaidByClient = round2(
    payment.amount + (payment.clientFee || 0)
  );

  const ids = {
    freelancerId: payment.freelancer,
    project: payment.project,
    milestone: milestone._id,
    payment: payment._id,
    session,
  };

  let refundAmount = 0;

  if (decision === "RESOLVED_FREELANCER") {
    await releasePendingToAvailable({
      ...ids,
      amount: net,
      reference: `DISPUTE-RELEASE-${payment._id}`,
      description: `Dispute resolved in your favour: ${milestone.title}`,
    });

    payment.status = "RELEASED";
    payment.releasedAt = new Date();
    milestone.status = "RELEASED";
    milestone.releasedAt = new Date();
  } else if (decision === "RESOLVED_CLIENT") {
    await removeFromPending({
      ...ids,
      amount: net,
      reference: `DISPUTE-REFUND-${payment._id}`,
      description: `Dispute resolved in the client's favour: ${milestone.title}`,
    });

    refundAmount = grossPaidByClient;

    payment.status = "REFUND_PENDING";
    milestone.status = "REFUNDED";
  } else if (decision === "PARTIAL_RESOLUTION") {
    const pct = Number(freelancerPercent);

    if (!Number.isFinite(pct) || pct < 1 || pct > 99) {
      throw new AppError(
        "freelancerPercent must be between 1 and 99 for a partial resolution",
        400
      );
    }

    const freelancerShare = round2((net * pct) / 100);
    const clientShareOfNet = round2(net - freelancerShare);

    await releasePendingToAvailable({
      ...ids,
      amount: freelancerShare,
      reference: `DISPUTE-PARTIAL-RELEASE-${payment._id}`,
      description: `Partial dispute settlement (${pct}%): ${milestone.title}`,
    });

    await removeFromPending({
      ...ids,
      amount: clientShareOfNet,
      reference: `DISPUTE-PARTIAL-REFUND-${payment._id}`,
      description: `Partial dispute refund (${100 - pct}%): ${milestone.title}`,
    });

    refundAmount = round2(
      (grossPaidByClient * (100 - pct)) / 100
    );

    payment.status = "REFUND_PENDING";
    milestone.status = "RELEASED";
    milestone.releasedAt = new Date();
  } else {
    throw new AppError("Invalid dispute decision", 400);
  }

  payment.metadata = {
    ...(payment.metadata || {}),
    dispute: {
      disputeId: dispute._id,
      decision,
      refundAmount,
      freelancerPercent: freelancerPercent ?? null,
    },
  };

  // A pure release has nothing left to refund.
  if (refundAmount === 0) {
    payment.status = "RELEASED";
  }

  await payment.save({ session });
  await milestone.save({ session });

  /*
   * The project was set to DISPUTED when the dispute
   * opened. Put it back unless another dispute on this
   * project is still open, then see whether the project
   * is now finished.
   */
  const otherOpenDisputes = await Dispute.countDocuments({
    project: dispute.project,
    _id: { $ne: dispute._id },
    status: {
      $in: ["OPEN", "UNDER_REVIEW", "AWAITING_RESPONSE"],
    },
  }).session(session);

  if (otherOpenDisputes === 0) {
    await Project.findByIdAndUpdate(
      dispute.project,
      { $set: { status: "IN_PROGRESS" } },
      { session }
    );

    await checkProjectCompletion(dispute.project, session);
  }

  return { payment, refundAmount };
};

/*
====================================================
START THE PAYSTACK REFUND (call AFTER the
transaction commits - never hold a DB transaction
open across an HTTP call)

The payment stays REFUND_PENDING until Paystack
sends the refund.processed webhook.
====================================================
*/
const startPaystackRefund = async (payment, refundAmount) => {
  if (!payment || refundAmount <= 0) return;

  try {
    await paystack.post("/refund", {
      transaction: payment.providerReference,
      amount: Math.round(refundAmount * 100),
    });
  } catch (error) {
    // Money was already taken out of the freelancer's pending
    // balance, so do NOT roll anything back. The payment stays
    // REFUND_PENDING so an admin can see it and retry.
    console.error(
      `Paystack refund failed for payment ${payment._id}:`,
      error.response?.data || error.message
    );
  }
};

module.exports = {
  settleDisputeFunds,
  startPaystackRefund,
};
