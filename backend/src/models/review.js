const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    communicationRating: {
      type: Number,
      min: 1,
      max: 5,
    },

    qualityRating: {
      type: Number,
      min: 1,
      max: 5,
    },

    deadlineRating: {
      type: Number,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index(
  {
    project: 1,
    reviewer: 1,
  },
  {
    unique: true,
  }
);

module.exports =
  mongoose.models.Review ||
  mongoose.model("Review", reviewSchema);