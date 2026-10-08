const asyncHandler = require("../utils/asyncHandler");
const Payment = require("../models/Payment.js");
const Withdrawal = require("../models/Withdrawal.js");

const { getAdminStats } = require("../services/adminStats");
const { retryRefund } = require("../services/adminRefunds");

const MAX_ROWS = 100;
const STUCK_WITHDRAWAL_MS = 60 * 60 * 1000;

const OUTCOME_MESSAGES = {
  REQUESTED: "Refund requested. Paystack will confirm it shortly.",
  ALREADY_IN_PROGRESS:
    "Paystack is already processing this refund, so no new one was created.",
  ALREADY_REFUNDED: "Paystack had already refunded this. The payment is now marked refunded.",
};

/*
====================================================
GET /api/admin/stats
====================================================
*/
const getStats = asyncHandler(async (req, res) => {
  const stats = await getAdminStats();

  res.status(200).json({ success: true, data: { stats } });
});

/*
====================================================
GET /api/admin/payments?status=
Newest first. Refunds waiting on Paystack show up here.
====================================================
*/
const listPayments = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.status) filter.status = String(req.query.status);

  const payments = await Payment.find(filter)
    .sort({ createdAt: -1 })
    .limit(MAX_ROWS)
    .populate("client", "name")
    .populate("freelancer", "name")
    .populate("project", "title")
    .populate("milestone", "title")
    .lean();

  res.status(200).json({
    success: true,
    data: {
      payments: payments.map((payment) => ({
        _id: payment._id,
        status: payment.status,
        amount: payment.amount,
        clientFee: payment.clientFee || 0,
        freelancerFee: payment.freelancerFee || 0,
        currency: payment.currency,
        client: payment.client?.name || "—",
        freelancer: payment.freelancer?.name || "—",
        project: payment.project?.title || "—",
        milestone: payment.milestone?.title || "—",
        reference: payment.providerReference,
        refundAmount: payment.metadata?.dispute?.refundAmount ?? null,
        lastRefundRetry: payment.metadata?.refundRetry || null,
        createdAt: payment.createdAt,
      })),
    },
  });
});

/*
====================================================
GET /api/admin/withdrawals?status=
Read only. A transfer stuck in PROCESSING is flagged.
====================================================
*/
const listWithdrawals = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.status) filter.status = String(req.query.status);

  const withdrawals = await Withdrawal.find(filter)
    .sort({ createdAt: -1 })
    .limit(MAX_ROWS)
    .populate("freelancer", "name")
    .lean();

  const now = Date.now();

  res.status(200).json({
    success: true,
    data: {
      withdrawals: withdrawals.map((withdrawal) => ({
        _id: withdrawal._id,
        status: withdrawal.status,
        amount: withdrawal.amount,
        freelancer: withdrawal.freelancer?.name || "—",
        reference: withdrawal.reference,
        failureReason: withdrawal.failureReason || "",
        stuck:
          ["PENDING", "PROCESSING"].includes(withdrawal.status) &&
          now - new Date(withdrawal.updatedAt).getTime() > STUCK_WITHDRAWAL_MS,
        createdAt: withdrawal.createdAt,
      })),
    },
  });
});

/*
====================================================
POST /api/admin/payments/:paymentId/retry-refund
====================================================
*/
const retryPaymentRefund = asyncHandler(async (req, res) => {
  const { outcome } = await retryRefund(req.params.paymentId, req.user._id);

  res.status(200).json({
    success: true,
    message: OUTCOME_MESSAGES[outcome],
    data: { outcome },
  });
});

module.exports = {
  getStats,
  listPayments,
  listWithdrawals,
  retryPaymentRefund,
};
