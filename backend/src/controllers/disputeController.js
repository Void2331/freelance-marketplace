const mongoose = require("mongoose");

const Project = require("../models/project.js");
const Milestone = require("../models/milestone.js");
const Dispute = require("../models/Dispute");
const ProjectActivity = require("../models/projectActivity.js");
const User = require("../models/user.js");
const emailService = require("../services/email.js");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError.js");

const {
  settleDisputeFunds,
  startPaystackRefund,
} = require("../services/disputeSettlement.js");

// A dispute only makes sense while money is held in escrow.
const DISPUTABLE_MILESTONE_STATUSES = [
  "FUNDED",
  "IN_PROGRESS",
  "SUBMITTED",
  "REVISION_REQUESTED",
];

const openDispute = async (req, res, next) => {
  const session = await mongoose.startSession();

  // Captured inside the transaction, used after it commits to notify
  // the other party.
  let newDisputeInfo = null;

  try {
    const { milestoneId } = req.params;

    const { reason, description, evidence = [] } = req.body;

    if (!reason || !description) {
      return res.status(400).json({
        success: false,
        message: "Reason and description are required",
      });
    }

    await session.withTransaction(async () => {
      const milestone = await Milestone.findById(milestoneId).session(
        session
      );

      if (!milestone) {
        throw new AppError("Milestone not found", 404);
      }

      const isClient =
        milestone.client.toString() === req.user._id.toString();

      const isFreelancer =
        milestone.freelancer.toString() === req.user._id.toString();

      if (!isClient && !isFreelancer) {
        throw new AppError("You are not part of this milestone", 403);
      }

      if (!DISPUTABLE_MILESTONE_STATUSES.includes(milestone.status)) {
        throw new AppError(
          "A dispute can only be opened while the milestone is funded or awaiting approval",
          400
        );
      }

      const existing = await Dispute.findOne({
        milestone: milestone._id,
        status: {
          $nin: [
            "CLOSED",
            "RESOLVED_CLIENT",
            "RESOLVED_FREELANCER",
            "PARTIAL_RESOLUTION",
          ],
        },
      }).session(session);

      if (existing) {
        throw new AppError("An active dispute already exists", 409);
      }

      const against = isClient ? milestone.freelancer : milestone.client;

      newDisputeInfo = {
        againstId: against,
        title: milestone.title,
        projectId: milestone.project,
      };

      const disputes = await Dispute.create(
        [
          {
            project: milestone.project,
            milestone: milestone._id,
            openedBy: req.user._id,
            against,
            reason,
            description,
            evidence,
            status: "OPEN",
          },
        ],
        { session }
      );

      milestone.status = "DISPUTED";

      await milestone.save({ session });

      await Project.findByIdAndUpdate(
        milestone.project,
        { $set: { status: "DISPUTED" } },
        { session }
      );

      await ProjectActivity.create(
        [
          {
            project: milestone.project,
            user: req.user._id,
            type: "DISPUTE_OPENED",
            message: "A dispute was opened for this milestone.",
            milestone: milestone._id,
            metadata: {
              disputeId: disputes[0]._id,
            },
          },
        ],
        { session }
      );
    });

    if (newDisputeInfo) {
      const otherParty = await User.findById(
        newDisputeInfo.againstId
      ).select("name email");

      if (otherParty) {
        emailService.sendDisputeOpenedEmail(
          otherParty.email,
          otherParty.name,
          newDisputeInfo.title,
          newDisputeInfo.projectId
        );
      }
    }

    return res.status(201).json({
      success: true,
      message: "Dispute opened successfully",
    });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
};

const resolveDispute = async (req, res, next) => {
  const session = await mongoose.startSession();

  // Declared outside the transaction so it is visible after it commits.
  let settlement = null;

  try {
    const { disputeId } = req.params;
    const { decision, resolution, freelancerPercent } = req.body;

    const validDecisions = [
      "RESOLVED_CLIENT",
      "RESOLVED_FREELANCER",
      "PARTIAL_RESOLUTION",
    ];

    if (!validDecisions.includes(decision)) {
      return res.status(400).json({
        success: false,
        message: "Invalid dispute decision",
      });
    }

    if (!resolution) {
      return res.status(400).json({
        success: false,
        message: "Resolution explanation is required",
      });
    }

    // 0% or 100% is just one side winning outright, so a partial
    // settlement must be between 1 and 99.
    if (
      decision === "PARTIAL_RESOLUTION" &&
      (typeof freelancerPercent !== "number" ||
        freelancerPercent < 1 ||
        freelancerPercent > 99)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "freelancerPercent (1-99) is required for partial resolution",
      });
    }

    await session.withTransaction(async () => {
      // A retried transaction must start clean.
      settlement = null;

      const dispute = await Dispute.findById(disputeId).session(session);

      if (!dispute) {
        throw new AppError("Dispute not found", 404);
      }

      if (
        !["OPEN", "UNDER_REVIEW", "AWAITING_RESPONSE"].includes(
          dispute.status
        )
      ) {
        throw new AppError("Dispute has already been resolved", 409);
      }

      // Move the money (database work only) inside the transaction.
      // If this throws, the status change below rolls back too.
      settlement = await settleDisputeFunds({
        dispute,
        decision,
        freelancerPercent,
        session,
      });

      dispute.status = decision;
      dispute.resolution = resolution;
      dispute.resolvedBy = req.user._id;
      dispute.resolvedAt = new Date();

      await dispute.save({ session });

      await ProjectActivity.create(
        [
          {
            project: dispute.project,
            user: req.user._id,
            type: "DISPUTE_RESOLVED",
            message: "Dispute resolved by marketplace administration.",
            milestone: dispute.milestone,
            metadata: {
              disputeId: dispute._id,
              decision,
              freelancerPercent: freelancerPercent ?? null,
              refundAmount: settlement?.refundAmount ?? 0,
            },
          },
        ],
        { session }
      );
    });

    // AFTER the transaction has committed: the external Paystack call.
    if (settlement?.refundAmount > 0) {
      await startPaystackRefund(
        settlement.payment,
        settlement.refundAmount
      );
    }

    return res.status(200).json({
      success: true,
      message: "Dispute resolved successfully",
    });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
};

const DISPUTE_POPULATE = [
  { path: "project", select: "title currency totalAmount status" },
  { path: "milestone", select: "title amount currency status" },
  { path: "openedBy", select: "name email role" },
  { path: "against", select: "name email role" },
  { path: "resolvedBy", select: "name" },
];

/*
====================================================
ADMIN: LIST ALL DISPUTES (optional ?status=)
====================================================
*/
const listDisputes = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const disputes = await Dispute.find(filter)
    .sort({ createdAt: -1 })
    .populate(DISPUTE_POPULATE);

  res.status(200).json({
    success: true,
    data: { disputes },
  });
});

/*
====================================================
LIST DISPUTES FOR ONE PROJECT
Only the project's client, its freelancer, or an admin.
====================================================
*/
const getProjectDisputes = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId);

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

  if (!isParticipant && req.user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to view these disputes",
    });
  }

  const disputes = await Dispute.find({ project: project._id })
    .sort({ createdAt: -1 })
    .populate(DISPUTE_POPULATE);

  res.status(200).json({
    success: true,
    data: { disputes },
  });
});

module.exports = {
  listDisputes,
  getProjectDisputes,
  openDispute,
  resolveDispute,
};
