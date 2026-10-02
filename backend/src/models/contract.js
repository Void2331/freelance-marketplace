const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      unique: true,
      index: true,
    },

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

    proposal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proposal",
      required: true,
      unique: true,
    },

    contractType: {
      type: String,
      enum: ["FIXED_PRICE"],
      default: "FIXED_PRICE",
    },

    status: {
      type: String,
      enum: [
        "PENDING_PAYMENT",
        "ACTIVE",
        "PAUSED",
        "COMPLETED",
        "CANCELLED",
        "DISPUTED",
      ],
      default: "PENDING_PAYMENT",
      index: true,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    cancellationReason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Contract ||
  mongoose.model("Contract", contractSchema);