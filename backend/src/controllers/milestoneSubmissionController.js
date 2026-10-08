const mongoose = require("mongoose");

const Milestone = require("../models/milestone.js");
const MilestoneSubmission = require("../models/milestoneSubmission.js");
const ProjectActivity = require("../models/projectActivity.js");
const Contract = require("../models/contract.js");
const User = require("../models/user.js");

const emailService = require("../services/email.js");
const uploadToCloudinary = require("../utils/cloudinaryUpload.js");
const AppError = require("../utils/AppError.js");

/*
====================================================
SUBMIT / RESUBMIT MILESTONE
====================================================

Initial submission:

FUNDED / IN_PROGRESS
        ↓
MilestoneSubmission v1
        ↓
SUBMITTED

Revision flow:

SUBMITTED
        ↓
Client requests changes
        ↓
REVISION_REQUESTED
        ↓
Freelancer resubmits
        ↓
MilestoneSubmission v2
        ↓
SUBMITTED

Every submission keeps its own attachments.
====================================================
*/

const submitMilestone = async (req, res, next) => {
  const session = await mongoose.startSession();

  let submittedMilestoneInfo = null;

  try {
    const { milestoneId } = req.params;
    const { message } = req.body;

    /*
    ================================================
    Validate submission message
    ================================================
    */
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Submission message is required",
      });
    }

    /*
    ================================================
    Upload attachments to Cloudinary
    ================================================
    */

    const attachments = [];

    for (const file of req.files || []) {
      const result = await uploadToCloudinary(file.buffer, {
        folder: `freelance-marketplace/milestones/${milestoneId}`,
      });

      attachments.push({
        url: result.secure_url,
        publicId: result.public_id,
        fileName: file.originalname,
        fileType: file.mimetype,
        size: file.size,
      });
    }

    /*
    ================================================
    Transaction
    ================================================
    */

    await session.withTransaction(async () => {
      const milestone = await Milestone.findById(milestoneId).session(
        session
      );

      if (!milestone) {
        throw new AppError("Milestone not found", 404);
      }

      /*
      ================================================
      Verify assigned freelancer
      ================================================
      */

      if (
        milestone.freelancer.toString() !== req.user._id.toString()
      ) {
        throw new AppError(
          "Only the assigned freelancer can submit this milestone",
          403
        );
      }

      /*
      ================================================
      Allowed milestone statuses
      ================================================
      */

      const allowedSubmissionStatuses = [
        "FUNDED",
        "IN_PROGRESS",
        "REVISION_REQUESTED",
      ];

      if (!allowedSubmissionStatuses.includes(milestone.status)) {
        throw new AppError(
          "This milestone cannot be submitted in its current state",
          400
        );
      }

      /*
      ================================================
      Revision validation
      ================================================
      */

      if (milestone.status === "REVISION_REQUESTED") {
        const previousSubmission =
          await MilestoneSubmission.findOne({
            milestone: milestone._id,
            status: "REVISION_REQUESTED",
          })
            .sort({ version: -1 })
            .session(session);

        if (!previousSubmission) {
          throw new AppError(
            "No submission requiring revision was found",
            400
          );
        }
      }

      /*
      ================================================
      Save information for client email
      ================================================
      */

      submittedMilestoneInfo = {
        clientId: milestone.client,
        title: milestone.title,
        projectId: milestone.project,
      };

      /*
      ================================================
      Verify active contract
      ================================================
      */

      const contract = await Contract.findOne({
        project: milestone.project,
        freelancer: req.user._id,
        status: "ACTIVE",
      }).session(session);

      if (!contract) {
        throw new AppError("Active contract not found", 404);
      }

      /*
      ================================================
      Determine submission version
      ================================================

      First submission:
        1

      First revision:
        2

      Second revision:
        3
      */

      const latestSubmission = await MilestoneSubmission.findOne({
        milestone: milestone._id,
      })
        .sort({ version: -1 })
        .session(session);

      const nextVersion = latestSubmission
        ? latestSubmission.version + 1
        : 1;

      /*
      ================================================
      Create milestone submission
      ================================================
      */

      const submission = await MilestoneSubmission.create(
        [
          {
            milestone: milestone._id,
            project: milestone.project,
            freelancer: req.user._id,
            client: milestone.client,
            message: message.trim(),
            attachments,
            version: nextVersion,
            status: "SUBMITTED",
          },
        ],
        { session }
      );

      /*
      ================================================
      Update milestone
      ================================================
      */

      milestone.status = "SUBMITTED";

      await milestone.save({ session });

      /*
      ================================================
      Project activity
      ================================================
      */

      await ProjectActivity.create(
        [
          {
            project: milestone.project,
            user: req.user._id,
            type: "MILESTONE_SUBMITTED",
            message:
              nextVersion > 1
                ? `Milestone resubmitted for review (version ${nextVersion}).`
                : "Milestone submitted for review.",
            milestone: milestone._id,
            metadata: {
              submissionId: submission[0]._id,
              version: nextVersion,
            },
          },
        ],
        { session }
      );
    });

    /*
    ================================================
    Send email after transaction commits
    ================================================
    */

    if (submittedMilestoneInfo) {
      const client = await User.findById(
        submittedMilestoneInfo.clientId
      ).select("name email");

      if (client) {
        await emailService.sendMilestoneSubmittedEmail(
          client.email,
          client.name,
          submittedMilestoneInfo.title,
          submittedMilestoneInfo.projectId
        );
      }
    }

    return res.status(201).json({
      success: true,
      message: "Milestone submitted successfully",
    });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
};

/*
====================================================
REQUEST CHANGES
====================================================
*/

const requestChanges = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const { milestoneId } = req.params;
    const { message } = req.body;

    /*
    ================================================
    Validate message
    ================================================
    */

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please explain what needs to be changed",
      });
    }

    /*
    ================================================
    Transaction
    ================================================
    */

    await session.withTransaction(async () => {
      const milestone = await Milestone.findById(milestoneId).session(
        session
      );

      if (!milestone) {
        throw new AppError("Milestone not found", 404);
      }

      /*
      ================================================
      Verify client
      ================================================
      */

      if (milestone.client.toString() !== req.user._id.toString()) {
        throw new AppError(
          "Only the client can request changes",
          403
        );
      }

      /*
      ================================================
      Verify milestone is submitted
      ================================================
      */

      if (milestone.status !== "SUBMITTED") {
        throw new AppError(
          "Milestone is not awaiting review",
          400
        );
      }

      /*
      ================================================
      Find latest submission
      ================================================
      */

      const latestSubmission =
        await MilestoneSubmission.findOne({
          milestone: milestone._id,
        })
          .sort({ version: -1 })
          .session(session);

      if (!latestSubmission) {
        throw new AppError(
          "No milestone submission found",
          404
        );
      }

      /*
      ================================================
      Mark latest submission as requiring revision
      ================================================
      */

      latestSubmission.status = "REVISION_REQUESTED";
      latestSubmission.revisionMessage = message.trim();

      await latestSubmission.save({ session });

      /*
      ================================================
      Update milestone
      ================================================
      */

      milestone.status = "REVISION_REQUESTED";

      await milestone.save({ session });

      /*
      ================================================
      Project activity
      ================================================
      */

      await ProjectActivity.create(
        [
          {
            project: milestone.project,
            user: req.user._id,
            type: "MILESTONE_REVISION_REQUESTED",
            message: "Client requested changes to the milestone.",
            milestone: milestone._id,
            metadata: {
              submissionId: latestSubmission._id,
              message: message.trim(),
            },
          },
        ],
        { session }
      );
    });

    return res.status(200).json({
      success: true,
      message: "Revision requested successfully",
    });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
};

/*
====================================================
GET MILESTONE SUBMISSIONS
====================================================
*/

const getMilestoneSubmissions = async (req, res, next) => {
  try {
    const { milestoneId } = req.params;

    const milestone = await Milestone.findById(milestoneId);

    if (!milestone) {
      throw new AppError("Milestone not found", 404);
    }

    const userId = req.user._id.toString();

    const isClient =
      milestone.client.toString() === userId;

    const isFreelancer =
      milestone.freelancer.toString() === userId;

    const isAdmin = req.user.role === "ADMIN";

    if (!isClient && !isFreelancer && !isAdmin) {
      throw new AppError(
        "You are not authorized to view these submissions",
        403
      );
    }

    const submissions = await MilestoneSubmission.find({
      milestone: milestone._id,
    })
      .sort({ version: -1 })
      .populate("freelancer", "name email")
      .populate("client", "name email");

    return res.status(200).json({
      success: true,
      data: {
        submissions,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitMilestone,
  requestChanges,
  getMilestoneSubmissions,
};