const mongoose = require("mongoose");

const withdrawalAccountSchema =
  new mongoose.Schema(
    {
      freelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
      },

      bankCode: {
        type: String,
        required: true,
      },

      bankName: {
        type: String,
        required: true,
      },

      accountNumber: {
        type: String,
        required: true,
        select: false,
      },

      accountName: {
        type: String,
        required: true,
      },

      recipientCode: {
        type: String,
        required: true,
      },

      verified: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
    }
  );

module.exports = mongoose.model(
  "WithdrawalAccount",
  withdrawalAccountSchema
);