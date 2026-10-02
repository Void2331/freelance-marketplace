const mongoose = require("mongoose");

const withdrawalSchema =
  new mongoose.Schema(
    {
      freelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      withdrawalAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WithdrawalAccount",
        required: true,
      },

      amount: {
        type: Number,
        required: true,
        min: 1,
      },

      reference: {
        type: String,
        required: true,
        unique: true,
      },

      status: {
        type: String,
        enum: [
          "PENDING",
          "PROCESSING",
          "SUCCESS",
          "FAILED",
          "REVERSED",
        ],
        default: "PENDING",
      },

      paystackTransferCode: String,

      failureReason: String,

      processedAt: Date,
    },
    {
      timestamps: true,
    }
  );

module.exports = mongoose.model(
  "Withdrawal",
  withdrawalSchema
);