const mongoose = require("mongoose");

const projectActivitySchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

 user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  default: null,
},

    type: {
      type: String,
      enum: [
        "PROJECT_CREATED",
        "CONTRACT_CREATED",
        "PAYMENT_INITIALIZED",
        "PAYMENT_FUNDED",
        "MILESTONE_STARTED",
        "WORK_SUBMITTED",
        "REVISION_REQUESTED",
        "MILESTONE_APPROVED",
        "PAYMENT_RELEASED",
        "DISPUTE_OPENED",
        "DISPUTE_RESOLVED",
        "PROJECT_COMPLETED",
        "PROJECT_CANCELLED",
      ],
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    milestone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Milestone",
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

projectActivitySchema.index({
  project: 1,
  createdAt: -1,
});

module.exports =
  mongoose.models.ProjectActivity ||
  mongoose.model(
    "ProjectActivity",
    projectActivitySchema
  );