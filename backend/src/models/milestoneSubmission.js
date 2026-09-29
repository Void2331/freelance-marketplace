const mongoose = require("mongoose");

const milestoneSubmissionSchema =
  new mongoose.Schema(
    {
      milestone: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Milestone",
        required: true,
        index: true,
      },

      project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
        index: true,
      },

      freelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000,
      },

      attachments: [
        {
          name: String,
          url: String,
          mimeType: String,
          size: Number,
        },
      ],

      version: {
        type: Number,
        default: 1,
      },

      status: {
        type: String,
        enum: [
          "PENDING_REVIEW",
          "APPROVED",
          "REVISION_REQUESTED",
          "DISPUTED",
        ],
        default: "PENDING_REVIEW",
      },

      submittedAt: {
        type: Date,
        default: Date.now,
      },

      reviewedAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

milestoneSubmissionSchema.index({
  milestone: 1,
  version: 1,
});

module.exports =
  mongoose.models.MilestoneSubmission ||
  mongoose.model(
    "MilestoneSubmission",
    milestoneSubmissionSchema
  );