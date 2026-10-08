const mongoose = require("mongoose");

const milestoneSubmissionSchema = new mongoose.Schema(
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

    /*
    ====================================================
    ATTACHMENTS
    ====================================================

    Files are uploaded to Cloudinary.

    Example:
    {
      url: "https://res.cloudinary.com/...",
      publicId: "freelance-marketplace/milestones/...",
      fileName: "design.pdf",
      fileType: "application/pdf",
      size: 245678
    }
    */
    attachments: [
      {
        url: {
          type: String,
          required: true,
        },

        publicId: {
          type: String,
          required: true,
        },

         mimeType: {
      type: String,
    },

        fileName: {
          type: String,
          required: true,
        },

        fileType: {
          type: String,
          required: true,
        },

        size: {
          type: Number,
          required: true,
        },
      },
    ],

    /*
    ====================================================
    SUBMISSION VERSION
    ====================================================

    First submission = 1
    After revision request = 2
    Next revision = 3
    */
    version: {
      type: Number,
      default: 1,
      min: 1,
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
      index: true,
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

/*
====================================================
INDEX
====================================================

Allows submissions to be efficiently retrieved
by milestone and version.
*/
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