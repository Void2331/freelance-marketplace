const mongoose = require("mongoose");

const Milestone = require("../models/milestone.js");
const Payment = require("../models/Payment.js");
const MilestoneSubmission = require("../models/milestoneSubmission.js");
const ProjectActivity = require("../models/projectActivity.js");
const User = require("../models/user.js");
const emailService = require("./email.js");

const { releasePendingToAvailable } = require("./fundsRelease.js");
const { checkProjectCompletion } = require("./projectCompletion.js");

const AUTO_APPROVE_DAYS =
  Number(process.env.MILESTONE_AUTO_APPROVE_DAYS) || 7;

const CHECK_INTERVAL_MS = 60 * 60 * 1000; // hourly

/*
====================================================
AUTO-APPROVE ONE MILESTONE
Re-checks everything inside the transaction, so it is
safe if the client approves at the same moment or if
two server instances run this at once.
====================================================
*/
const autoApproveMilestone = async (milestoneId) => {
  const session = await mongoose.startSession();
  let info = null;

  try {
    await session.withTransaction(async () => {
      info = null;

      const milestone = await Milestone.findById(
        milestoneId
      ).session(session);

      if (!milestone || milestone.status !== "SUBMITTED") {
        return; // already handled (approved, disputed, revised)
      }

      const submission = await MilestoneSubmission.findOne({
        milestone: milestone._id,
        status: "PENDING_REVIEW",
      })
        .sort({ createdAt: -1 })
        .session(session);

      const payment = await Payment.findOne({
        milestone: milestone._id,
        status: "FUNDED",
      }).session(session);

      if (!submission || !payment) return;

      const net = payment.freelancerNetAmount || payment.amount;

      await releasePendingToAvailable({
        freelancerId: milestone.freelancer,
        amount: net,
        project: milestone.project,
        milestone: milestone._id,
        payment: payment._id,
        reference: `AUTO-RELEASE-${payment._id}`,
        description: `Auto-approved after ${AUTO_APPROVE_DAYS} days: ${milestone.title}`,
        session,
      });

      payment.status = "RELEASED";
      payment.releasedAt = new Date();
      await payment.save({ session });

      milestone.status = "RELEASED";
      milestone.approvedAt = new Date();
      milestone.releasedAt = new Date();
      await milestone.save({ session });

      submission.status = "APPROVED";
      submission.reviewedAt = new Date();
      await submission.save({ session });

      await checkProjectCompletion(milestone.project, session);

      await ProjectActivity.create(
        [
          {
            project: milestone.project,
            user: null,
            type: "MILESTONE_APPROVED",
            milestone: milestone._id,
            message: `The client did not respond within ${AUTO_APPROVE_DAYS} days, so the milestone was approved automatically and payment released.`,
          },
        ],
        { session }
      );

      info = {
        freelancerId: milestone.freelancer,
        title: milestone.title,
        currency: milestone.currency,
        amount: net,
        projectId: milestone.project,
      };
    });
  } finally {
    await session.endSession();
  }

  if (info) {
    const freelancer = await User.findById(
      info.freelancerId
    ).select("name email");

    if (freelancer) {
      emailService
        .sendMilestoneApprovedEmail(
          freelancer.email,
          freelancer.name,
          info.title,
          info.amount,
          info.currency,
          info.projectId
        )
        .catch((error) =>
          console.error("Auto-approval email failed:", error.message)
        );
    }
  }

  return Boolean(info);
};

const runAutoApproval = async () => {
  const cutoff = new Date(
    Date.now() - AUTO_APPROVE_DAYS * 24 * 60 * 60 * 1000
  );

  const stale = await Milestone.find({
    status: "SUBMITTED",
    submittedAt: { $lte: cutoff },
  }).select("_id");

  for (const { _id } of stale) {
    try {
      await autoApproveMilestone(_id);
    } catch (error) {
      console.error(
        `Auto-approval failed for milestone ${_id}:`,
        error.message
      );
    }
  }
};

const startAutoApprovalJob = () => {
  runAutoApproval().catch((error) =>
    console.error("Auto-approval run failed:", error.message)
  );

  setInterval(() => {
    runAutoApproval().catch((error) =>
      console.error("Auto-approval run failed:", error.message)
    );
  }, CHECK_INTERVAL_MS);
};

module.exports = { startAutoApprovalJob, runAutoApproval };
