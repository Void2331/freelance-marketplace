const mongoose = require("mongoose");

const Project = require("../models/project.js");
const Milestone = require("../models/milestone.js");
const Dispute = require("../models/Dispute");
const ProjectActivity = require("../models/projectActivity.js");
const asyncHandler = require("../utils/asyncHandler");

const openDispute = async (
  req,
  res,
  next
) => {
  const session = await mongoose.startSession();

  try {
    const { milestoneId } = req.params;

    const {
      reason,
      description,
      evidence = [],
    } = req.body;

    if (!reason || !description) {
      return res.status(400).json({
        success: false,
        message:
          "Reason and description are required",
      });
    }

    await session.withTransaction(async () => {
      const milestone =
        await Milestone.findById(
          milestoneId
        ).session(session);

      if (!milestone) {
        throw new Error(
          "Milestone not found"
        );
      }

      const isClient =
        milestone.client.toString() ===
        req.user._id.toString();

      const isFreelancer =
        milestone.freelancer.toString() ===
        req.user._id.toString();

      if (!isClient && !isFreelancer) {
        throw new Error(
          "You are not part of this milestone"
        );
      }

      const existing =
        await Dispute.findOne({
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
        throw new Error(
          "An active dispute already exists"
        );
      }

      const against = isClient
        ? milestone.freelancer
        : milestone.client;

      const disputes =
        await Dispute.create(
          [
            {
              project:
                milestone.project,

              milestone:
                milestone._id,

              openedBy:
                req.user._id,

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

      await milestone.save({
        session,
      });

      await Project.findByIdAndUpdate(
        milestone.project,
        {
          $set: {
            status: "DISPUTED",
          },
        },
        {
          session,
        }
      );

      await ProjectActivity.create(
        [
          {
            project:
              milestone.project,

            user:
              req.user._id,

            type:
              "DISPUTE_OPENED",

            message:
              "A dispute was opened for this milestone.",

            milestone:
              milestone._id,

            metadata: {
              disputeId:
                disputes[0]._id,
            },
          },
        ],
        { session }
      );
    });

    return res.status(201).json({
      success: true,
      message:
        "Dispute opened successfully",
    });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
};

const resolveDispute = async (
  req,
  res,
  next
) => {
  const session = await mongoose.startSession();

  try {
    const { disputeId } = req.params;

    const {
      decision,
      resolution,
    } = req.body;

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
        message:
          "Resolution explanation is required",
      });
    }

    await session.withTransaction(async () => {
      const dispute =
        await Dispute.findById(
          disputeId
        ).session(session);

      if (!dispute) {
        throw new Error(
          "Dispute not found"
        );
      }

      if (
        ![
          "OPEN",
          "UNDER_REVIEW",
          "AWAITING_RESPONSE",
        ].includes(dispute.status)
      ) {
        throw new Error(
          "Dispute has already been resolved"
        );
      }

      dispute.status = decision;

      dispute.resolution =
        resolution;

      dispute.resolvedBy =
        req.user._id;

      dispute.resolvedAt =
        new Date();

      await dispute.save({
        session,
      });

      await ProjectActivity.create(
        [
          {
            project:
              dispute.project,

            user:
              req.user._id,

            type:
              "DISPUTE_RESOLVED",

            message:
              "Dispute resolved by marketplace administration.",

            milestone:
              dispute.milestone,

            metadata: {
              disputeId:
                dispute._id,

              decision,
            },
          },
        ],
        { session }
      );
    });

    return res.status(200).json({
      success: true,
      message:
        "Dispute resolved successfully",
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