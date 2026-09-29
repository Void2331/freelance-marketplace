const Project = require("../models/project.js");
const Review = require("../models/review.js");

const User = require("../models/user.js");

const createReview = async (
  req,
  res,
  next
) => {
  try {
    const { projectId } = req.params;

    const {
      rating,
      communicationRating,
      qualityRating,
      deadlineRating,
      comment,
    } = req.body;

    if (
      !rating ||
      rating < 1 ||
      rating > 5
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Rating must be between 1 and 5",
      });
    }

    const project =
      await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (
      project.status !== "COMPLETED"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Reviews can only be submitted for completed projects",
      });
    }

    const userId =
      req.user._id.toString();

    const isClient =
      project.client.toString() ===
      userId;

    const isFreelancer =
      project.freelancer.toString() ===
      userId;

    if (!isClient && !isFreelancer) {
      return res.status(403).json({
        success: false,
        message:
          "Only project participants can leave reviews",
      });
    }

    const reviewee = isClient
      ? project.freelancer
      : project.client;

    const existing =
      await Review.findOne({
        project: project._id,
        reviewer: req.user._id,
      });

    if (existing) {
      return res.status(409).json({
        success: false,
        message:
          "You have already reviewed this project",
      });
    }

    const review =
      await Review.create({
        project: project._id,

        reviewer:
          req.user._id,

        reviewee,

        rating,

        communicationRating,

        qualityRating,

        deadlineRating,

        comment,
      });

    /*
     * Update reviewee's average rating.
     */

    const reviews =
      await Review.find({
        reviewee,
        isPublic: true,
      });

    const total =
      reviews.reduce(
        (sum, item) =>
          sum + item.rating,
        0
      );

    const average =
      total / reviews.length;

    /*
     * Only update if your User model
     * contains these fields.
     */

    await User.findByIdAndUpdate(
      reviewee,
      {
        $set: {
          averageRating:
            Math.round(average * 10) / 10,

          reviewCount:
            reviews.length,
        },
      }
    );

    return res.status(201).json({
      success: true,
      message:
        "Review submitted successfully",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

/*
====================================================
GET REVIEWS FOR A SPECIFIC PROJECT
Only the client/freelancer on that project can view
====================================================
*/
const getProjectReviews = async (
  req,
  res,
  next
) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(
      projectId
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const userId = req.user._id.toString();

    const isParticipant =
      project.client.toString() === userId ||
      project.freelancer.toString() === userId;

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message:
          "Only project participants can view these reviews",
      });
    }

    const reviews = await Review.find({
      project: project._id,
    }).populate("reviewer", "name avatar role");

    return res.status(200).json({
      success: true,
      data: { reviews },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getProjectReviews,
};