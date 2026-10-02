const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    pendingBalance: {
      type: Number,
      default: 0,
      min: 0
    },

    availableBalance: {
      type: Number,
      default: 0,
      min: 0
    },

    totalEarned: {
      type: Number,
      default: 0,
      min: 0
    },

    totalWithdrawn: {
      type: Number,
      default: 0,
      min: 0
    },

    currency: {
      type: String,
      default: "NGN",
      uppercase: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Wallet", walletSchema);