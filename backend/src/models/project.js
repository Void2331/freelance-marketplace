const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
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

    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contract",
      unique: true,
      sparse: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 1,
    },

    currency: {
      type: String,
      default: "NGN",
      uppercase: true,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "AWAITING_PAYMENT",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
        "DISPUTED",
      ],
      default: "AWAITING_PAYMENT",
      index: true,
    },

    funded: {
      type: Boolean,
      default: false,
    },

    fundedAt: {
      type: Date,
      default: null,
    },

    paymentReference: {
      type: String,
      unique: true,
      sparse: true,
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
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Project ||
  mongoose.model("Project", projectSchema);