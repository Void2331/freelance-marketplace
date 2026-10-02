const mongoose = require("mongoose");

const disputeSchema = new mongoose.Schema(
  {
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
      index: true,
    },

    openedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    against: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reason: {
      type: String,
      enum: [
        "NON_PAYMENT",
        "POOR_QUALITY",
        "SCOPE_DISAGREEMENT",
        "MISSED_DEADLINE",
        "NON_DELIVERY",
        "FRAUD",
        "OTHER",
      ],
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    evidence: [
      {
        name: String,
        url: String,
        mimeType: String,
      },
    ],

    status: {
      type: String,
      enum: [
        "OPEN",
        "UNDER_REVIEW",
        "AWAITING_RESPONSE",
        "RESOLVED_CLIENT",
        "RESOLVED_FREELANCER",
        "PARTIAL_RESOLUTION",
        "CLOSED",
      ],
      default: "OPEN",
      index: true,
    },

    resolution: {
      type: String,
      default: "",
    },

    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Dispute ||
  mongoose.model("Dispute", disputeSchema);