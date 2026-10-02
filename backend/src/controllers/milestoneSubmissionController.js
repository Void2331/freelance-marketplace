const mongoose = require("mongoose");

const Milestone = require("../models/milestone.js");
const Project = require("../models/project.js");
const Contract = require("../models/contract.js");
const MilestoneSubmission = require("../models/milestoneSubmission.js");
const ProjectActivity = require("../models/projectActivity.js");
const User = require("../models/user.js");
const emailService = require("../services/email.js");

const submitMilestone = async (
  req,
  res,
  next
) => {
  const session = await mongoose.startSession();

  // Captured inside the transaction, used after it commits to send the
  // "milestone submitted" email without holding the transaction open
  // for a network call.
  let submittedMilestoneInfo = null;

  try {
    const { milestoneId } = req.params;

    const { message, attachments = [] } =
      req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message:
          "Submission message is required",
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

      if (
        milestone.freelancer.toString() !==
        req.user._id.toString()
      ) {
        throw new Error(
          "Only the assigned freelancer can submit this milestone"
        );
      }

      submittedMilestoneInfo = {
        clientId: milestone.client,
        title: milestone.title,
        projectId: milestone.project,
      };

      if (
        ![
          "FUNDED",
          "IN_PROGRESS",
        ].includes(milestone.status)
      ) {
        throw new Error(
          "This milestone cannot be submitted in its current state"
        );
      }

      const contract =
        await Contract.findOne({
          project: milestone.project,
          freelancer: req.user._id,
          status: "ACTIVE",
        }).session(session);

      if (!contract) {
        throw new Error(
          "Active contract not found"
        );
      }

      const previousSubmissions =
        await MilestoneSubmission.countDocuments({
          milestone: milestone._id,
        }).session(session);

      const submission =
        await MilestoneSubmission.create(
          [
            {
              milestone: milestone._id,

              project: milestone.project,

              freelancer: req.user._id,

              message,

              attachments,

              version:
                previousSubmissions + 1,

              status: "PENDING_REVIEW",
            },
          ],
          { session }
        );

      milestone.status = "SUBMITTED";
      milestone.submittedAt = new Date();

      await milestone.save({ session });

      await ProjectActivity.create(
        [
          {
            project: milestone.project,

            user: req.user._id,

            type: "WORK_SUBMITTED",

            message:
              "Freelancer submitted milestone work for review.",

            milestone: milestone._id,

            metadata: {
              submissionId:
                submission[0]._id,
            },
          },
        ],
        { session }
      );
    });

    if (submittedMilestoneInfo) {
      const client = await User.findById(
        submittedMilestoneInfo.clientId
      ).select("name email");

      if (client) {
        emailService.sendMilestoneSubmittedEmail(
          client.email,
          client.name,
          submittedMilestoneInfo.title,
          submittedMilestoneInfo.projectId
        );
      }
    }

    return res.status(201).json({
      success: true,
      message:
        "Milestone submitted successfully",
    });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
};

const requestChanges = async (
  req,
  res,
  next
) => {
  const session = await mongoose.startSession();

  try {
    const { milestoneId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message:
          "Please explain what needs to be changed",
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

      if (
        milestone.client.toString() !==
        req.user._id.toString()
      ) {
        throw new Error(
          "Only the client can request changes"
        );
      }

      if (
        milestone.status !== "SUBMITTED"
      ) {
        throw new Error(
          "Milestone is not awaiting review"
        );
      }

      const submission =
        await MilestoneSubmission.findOne({
          milestone: milestone._id,
          status: "PENDING_REVIEW",
        })
          .sort({
            createdAt: -1,
          })
          .session(session);

      if (!submission) {
        throw new Error(
          "Active submission not found"
        );
      }

      submission.status =
        "REVISION_REQUESTED";

      submission.reviewedAt =
        new Date();

      await submission.save({
        session,
      });

      milestone.status =
        "REVISION_REQUESTED";

      await milestone.save({
        session,
      });

      await ProjectActivity.create(
        [
          {
            project: milestone.project,

            user: req.user._id,

            type: "REVISION_REQUESTED",

            message,

            milestone: milestone._id,
          },
        ],
        { session }
      );
    });

    return res.status(200).json({
      success: true,
      message:
        "Revision requested successfully",
    });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
};

module.exports = {
  submitMilestone,
  requestChanges,
};