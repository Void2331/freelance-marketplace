const mongoose = require("mongoose");

const milestoneSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
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

    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      default: "",
      maxlength: 2000,
    },

    amount: {
      type: Number,
      required: true,
      min: 100,
    },

    currency: {
      type: String,
      default: "NGN",
      uppercase: true,
      trim: true,
    },

    order: {
      type: Number,
      required: true,
      min: 1,
    },

    dueDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "FUNDED",
        "IN_PROGRESS",
        "SUBMITTED",
        "REVISION_REQUESTED",
        "APPROVED",
        "RELEASED",
        "REFUNDED",
        "DISPUTED",
        "CANCELLED",
        "REJECTED",
      ],
      default: "PENDING",
      index: true,
    },

    submissionNote: {
      type: String,
      default: "",
    },

    submittedAt: {
      type: Date,
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    releasedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

milestoneSchema.index({
  project: 1,
  order: 1,
});

module.exports =
  mongoose.models.Milestone ||
  mongoose.model("Milestone", milestoneSchema);