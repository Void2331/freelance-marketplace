const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    type: {
      type: String,
      enum: [
        "MILESTONE_EARNING",
        "PLATFORM_FEE",
        "WITHDRAWAL",
        "REFUND",
        "ADJUSTMENT"
      ],
      required: true
    },

    direction: {
      type: String,
      enum: ["CREDIT", "DEBIT"],
      required: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    currency: {
      type: String,
      default: "NGN",
      uppercase: true
    },

    description: {
      type: String,
      required: true
    },

    reference: {
      type: String,
      required: true,
      unique: true
    },

    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null
    },

    milestone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Milestone",
      default: null
    },

    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "COMPLETED"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Transaction",
  transactionSchema
);