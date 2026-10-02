const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    // =========================
    // INTERNAL PAYMENT REFERENCE
    // =========================
    reference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // =========================
    // PROJECT & MILESTONE
    // =========================
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

 milestone: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Milestone",
  required: true,
  unique: true,
  index: true,
},

    // =========================
    // USERS
    // =========================
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // =========================
    // AMOUNT & FEES
    // =========================
    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    clientFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    freelancerFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    freelancerNetAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    currency: {
      type: String,
      default: "NGN",
      uppercase: true,
      trim: true,
    },

    // =========================
    // MARKETPLACE PAYMENT STATUS
    // =========================
    status: {
      type: String,
      enum: [
        "PENDING",
        "PROCESSING",
        "FUNDED",
        "RELEASED",
        "REFUND_PENDING",
        "REFUNDED",
        "FAILED",
        "CANCELLED",
        "DISPUTED",
      ],
      default: "PENDING",
      index: true,
    },

    // =========================
    // PAYMENT PROVIDER
    // =========================
    provider: {
      type: String,
      enum: ["PAYSTACK"],
      default: "PAYSTACK",
    },

    providerReference: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    providerTransactionId: {
      type: String,
      default: null,
    },

    providerStatus: {
      type: String,
      default: null,
    },

    // =========================
    // PAYMENT DATES
    // =========================
    paidAt: {
      type: Date,
      default: null,
    },

    releasedAt: {
      type: Date,
      default: null,
    },

    refundedAt: {
      type: Date,
      default: null,
    },


    // =========================
    // PROVIDER / WEBHOOK DATA
    // =========================
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);



module.exports =
  mongoose.models.Payment ||
  mongoose.model("Payment", paymentSchema);