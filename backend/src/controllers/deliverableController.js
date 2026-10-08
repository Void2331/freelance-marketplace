const path = require("path");

const asyncHandler = require("../utils/asyncHandler.js");
const AppError = require("../utils/AppError.js");

const Milestone = require("../models/milestone.js");
const MilestoneSubmission = require("../models/MilestoneSubmission");

const getUserId = (req) => {
  return req.user?._id || req.user?.id;
};

/**
 * =========================================================
 * UPLOAD MILESTONE DELIVERABLES
 * =========================================================
 *
 * POST
 * /api/milestones/:milestoneId/deliverables/upload
 *
 * This endpoint ONLY uploads files.
 *
 * The actual milestone submission is created by:
 *
 * POST /api/milestones/:milestoneId/submit
 *
 * =========================================================
 */

const uploadDeliverables = asyncHandler(
  async (req, res, next) => {
    const { milestoneId } = req.params;

    const userId = getUserId(req);

    if (!userId) {
      return next(
        new AppError(
          "Authentication required",
          401,
        ),
      );
    }

    if (!req.files || req.files.length === 0) {
      return next(
        new AppError(
          "Please upload at least one file",
          400,
        ),
      );
    }

    const milestone = await Milestone.findById(
      milestoneId,
    );

    if (!milestone) {
      return next(
        new AppError(
          "Milestone not found",
          404,
        ),
      );
    }

    /**
     * Only the freelancer assigned to the milestone
     * can upload deliverables.
     */
    const freelancerId =
      milestone.freelancer ||
      milestone.assignedFreelancer;

    if (
      freelancerId &&
      freelancerId.toString() !==
        userId.toString()
    ) {
      return next(
        new AppError(
          "Only the assigned freelancer can upload deliverables",
          403,
        ),
      );
    }

    /**
     * Depending on your milestone implementation,
     * these are the statuses where uploading is allowed.
     */
    const allowedStatuses = [
      "FUNDED",
      "IN_PROGRESS",
      "REVISION_REQUESTED",
    ];

    if (
      milestone.status &&
      !allowedStatuses.includes(
        milestone.status,
      )
    ) {
      return next(
        new AppError(
          `Deliverables cannot be uploaded while the milestone is ${milestone.status}`,
          400,
        ),
      );
    }

    const baseUrl =
      `${req.protocol}://${req.get("host")}`;

    const attachments = req.files.map((file) => ({
      name: file.originalname,
      url: `${baseUrl}/uploads/deliverables/${encodeURIComponent(
        file.filename,
      )}`,
      mimeType: file.mimetype,
      size: file.size,
    }));

    return res.status(200).json({
      success: true,
      message: "Deliverables uploaded successfully",
      data: {
        attachments,
      },
    });
  },
);

/**
 * =========================================================
 * GET MILESTONE SUBMISSIONS
 * =========================================================
 *
 * GET
 * /api/milestones/:milestoneId/submissions
 *
 * Used by both freelancer and client.
 *
 * =========================================================
 */

const getMilestoneSubmissions = asyncHandler(
  async (req, res, next) => {
    const { milestoneId } = req.params;

    const userId = getUserId(req);

    if (!userId) {
      return next(
        new AppError(
          "Authentication required",
          401,
        ),
      );
    }

    const milestone = await Milestone.findById(
      milestoneId,
    );

    if (!milestone) {
      return next(
        new AppError(
          "Milestone not found",
          404,
        ),
      );
    }

    /**
     * We allow participants to see submission history.
     *
     * Depending on your Milestone schema, adjust these
     * fields if your project uses different names.
     */
    const isFreelancer =
      milestone.freelancer &&
      milestone.freelancer.toString() ===
        userId.toString();

    const isAssignedFreelancer =
      milestone.assignedFreelancer &&
      milestone.assignedFreelancer.toString() ===
        userId.toString();

    const isClient =
      milestone.client &&
      milestone.client.toString() ===
        userId.toString();

    const isParticipant =
      isFreelancer ||
      isAssignedFreelancer ||
      isClient;

    if (!isParticipant) {
      return next(
        new AppError(
          "You do not have access to this milestone",
          403,
        ),
      );
    }

    const submissions =
      await MilestoneSubmission.find({
        milestone: milestoneId,
      })
        .sort({
          version: -1,
          createdAt: -1,
        })
        .lean();

    return res.status(200).json({
      success: true,
      message:
        "Milestone submissions retrieved successfully",
      data: {
        submissions,
      },
    });
  },
);

module.exports = {
  uploadDeliverables,
  getMilestoneSubmissions,
};