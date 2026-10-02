const mongoose = require("mongoose");

const walletTransactionSchema =
  new mongoose.Schema(
    {
      wallet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Wallet",
        required: true,
        index: true,
      },

      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      type: {
        type: String,
        enum: [
          "MILESTONE_EARNING",
          "PLATFORM_FEE",
          "WITHDRAWAL",
          "REFUND",
          "REVERSAL",
          "ADJUSTMENT",
        ],
        required: true,
      },

      /*
       * Indicates which wallet balance
       * this transaction affected.
       */
      balanceType: {
        type: String,
        enum: ["PENDING", "AVAILABLE"],
        required: true,
        index: true,
      },

      direction: {
        type: String,
        enum: ["CREDIT", "DEBIT"],
        required: true,
      },

      amount: {
        type: Number,
        required: true,
        min: 1,
      },

      balanceBefore: {
        type: Number,
        required: true,
        min: 0,
      },

      balanceAfter: {
        type: Number,
        required: true,
        min: 0,
      },

      project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        default: null,
      },

      milestone: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Milestone",
        default: null,
      },

      payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
        default: null,
      },

      withdrawal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Withdrawal",
        default: null,
      },

      reference: {
        type: String,
        required: true,
        unique: true,
        index: true,
      },

      description: {
        type: String,
        default: "",
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.models.WalletTransaction ||
  mongoose.model(
    "WalletTransaction",
    walletTransactionSchema
  );