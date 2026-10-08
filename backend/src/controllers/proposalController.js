const mongoose = require("mongoose");
const crypto = require("crypto");

const proposalService = require("../services/proposal.js");
const emailService = require("../services/email.js");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError.js");

// Models
const Proposal = require("../models/proposal");
const Project = require("../models/project");
const Milestone = require("../models/milestone");
const Job = require("../models/job");
const Payment = require("../models/Payment");
const Contract = require("../models/contract");
const ProjectActivity = require("../models/projectActivity");
const {
  planMilestoneDrafts,
} = require("../services/milestoneSplit.js");


/*
====================================================
CREATE PROPOSAL
====================================================
*/

const createProposal = asyncHandler(
  async (req, res) => {
    const proposal =
      await proposalService.createProposal(
        req.params.jobId,
        req.user._id,
        req.body
      );

    emailService.sendNewProposalEmail(
      proposal.job.client.email,
      proposal.job.client.name,
      proposal.job.title,
      proposal.freelancer.name,
      proposal.job._id
    );

    res.status(201).json({
      success: true,
      message: "Proposal submitted successfully",
      data: {
        proposal,
      },
    });
  }
);


/*
====================================================
GET JOB PROPOSALS
====================================================
*/

const getJobProposals = asyncHandler(
  async (req, res) => {
    const proposals =
      await proposalService.getJobProposals(
        req.params.jobId,
        req.user._id
      );

    res.status(200).json({
      success: true,
      data: {
        proposals,
      },
    });
  }
);


/*
====================================================
GET MY PROPOSALS
====================================================
*/

const getMyProposals = asyncHandler(
  async (req, res) => {
    const proposals =
      await proposalService.getMyProposals(
        req.user._id
      );

    res.status(200).json({
      success: true,
      data: {
        proposals,
      },
    });
  }
);

/*
====================================================
GET CLIENT PROPOSALS
====================================================
*/

const getClientProposals = asyncHandler(
  async (req, res) => {
    const proposals =
      await proposalService.getClientProposals(
        req.user._id
      );

    res.status(200).json({
      success: true,
      data: {
        proposals,
      },
    });
  }
);


/*
====================================================
GET PROPOSAL BY ID
====================================================
*/

const getProposalById = asyncHandler(
  async (req, res) => {
    const proposal =
      await proposalService.getProposalById(
        req.params.id,
        req.user._id
      );

    res.status(200).json({
      success: true,
      data: {
        proposal,
      },
    });
  }
);


/*
====================================================
ACCEPT PROPOSAL
====================================================

FLOW:

1. Start transaction
2. Find proposal
3. Validate proposal
4. Check duplicate project
5. Create project
6. Create contract
7. Create project activity
8. Create milestone
9. Accept proposal
10. Update job
11. Generate payment reference
12. Create payment
13. Save payment reference
14. Commit transaction

====================================================
*/

const acceptProposal = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
  const { id: proposalId } = req.params;

    const clientId = req.user._id;

    let createdProject = null;
    let createdContract = null;
    let createdMilestone = null;
    let createdPayment = null;
    let acceptedProposal = null;
    let allMilestones = [];

    // The job's payment plan is used unless the client opts out.
    const usePaymentPlan = req.body?.usePaymentPlan !== false;

    await session.withTransaction(async () => {
      /*
      ==================================================
      1. FIND PROPOSAL
      ==================================================
      */

      const proposal = await Proposal.findById(
        proposalId
      )
        .populate("job")
        .populate("freelancer")
        .session(session);

      if (!proposal) {
        throw new AppError("Proposal not found", 404);
      }

      // Captured in the outer scope for the "proposal accepted" email,
      // sent after the transaction commits.
      acceptedProposal = proposal;

      /*
      ==================================================
      2. VERIFY JOB
      ==================================================
      */

      if (!proposal.job) {
        throw new AppError(
          "The job associated with this proposal no longer exists",
          404
        );
      }

      /*
      ==================================================
      3. VERIFY CLIENT
      ==================================================
      */

      if (
        proposal.job.client.toString() !==
        clientId.toString()
      ) {
        throw new AppError(
          "You are not allowed to accept this proposal",
          403
        );
      }

      /*
      ==================================================
      4. PROPOSAL MUST BE PENDING
      ==================================================
      */

      if (proposal.status !== "PENDING") {
        throw new AppError(
          "This proposal is no longer available",
          400
        );
      }

      /*
      ==================================================
      5. JOB MUST STILL BE OPEN
      ==================================================
      */

      if (proposal.job.status !== "OPEN") {
        throw new AppError(
          "This job is no longer open",
          400
        );
      }

      /*
      ==================================================
      6. MAKE SURE PROJECT DOESN'T ALREADY EXIST
      ==================================================
      */

      const existingProject =
        await Project.findOne({
          $or: [
            {
              proposal: proposal._id,
            },
            {
              job: proposal.job._id,
            },
          ],
        }).session(session);

      if (existingProject) {
        throw new AppError(
          "A project already exists for this job",
          409
        );
      }

      /*
      ==================================================
      7. CREATE PROJECT
      ==================================================
      */

      const projects = await Project.create(
        [
          {
            job: proposal.job._id,

            client: clientId,

            freelancer:
              proposal.freelancer._id,

            proposal: proposal._id,

            title:
              proposal.job.title,

            description:
              proposal.job.description || "",

            totalAmount:
              proposal.bidAmount,

            currency: "NGN",

            status:
              "AWAITING_PAYMENT",

            funded: false,

            fundedAt: null,

            startedAt: null,

            completedAt: null,
          },
        ],
        {
          session,
        }
      );

      createdProject = projects[0];

      /*
      ==================================================
      8. CREATE CONTRACT
      ==================================================
      */

      const contracts =
        await Contract.create(
          [
            {
              project:
                createdProject._id,

              client:
                clientId,

              freelancer:
                proposal.freelancer._id,

              proposal:
                proposal._id,

              contractType:
                "FIXED_PRICE",

              status:
                "PENDING_PAYMENT",
            },
          ],
          {
            session,
          }
        );

      createdContract = contracts[0];

      /*
      ==================================================
      9. CONNECT CONTRACT TO PROJECT
      ==================================================
      */

      createdProject.contract =
        createdContract._id;

      await createdProject.save({
        session,
      });

      /*
      ==================================================
      10. CREATE FIRST MILESTONE
      ==================================================
      */

      /*
        If the job has a valid payment plan, its shares are applied
        to the freelancer's bid and the project gets one milestone per
        step. Otherwise (no plan, or a plan we cannot trust) it gets a
        single milestone for the whole bid, exactly as before.
      */
      const planDrafts = usePaymentPlan
        ? planMilestoneDrafts(
            proposal.job.milestonePlan,
            proposal.bidAmount
          )
        : [];

      const firstDraft = planDrafts[0];

      const milestones =
        await Milestone.create(
          [
            {
              project:
                createdProject._id,

              client:
                clientId,

              freelancer:
                proposal.freelancer._id,

              title:
                firstDraft?.title ??
                "Project Milestone 1",

              description:
                firstDraft?.description ??
                "Complete the agreed project work.",

              amount:
                firstDraft?.amount ??
                proposal.bidAmount,

              currency: "NGN",

              order: 1,

              status: "PENDING",
            },
          ],
          {
            session,
          }
        );

      createdMilestone =
        milestones[0];

      /*
      ==================================================
      11. GENERATE INTERNAL PAYMENT REFERENCE
      ==================================================
      */

      const reference =
        `project-${createdProject._id}-${crypto
          .randomBytes(8)
          .toString("hex")}`
          .toLowerCase();

      /*
      ==================================================
      12. CREATE PAYMENT
      ==================================================
      */

      const payments =
        await Payment.create(
          [
            {
              reference,

              project:
                createdProject._id,

              milestone:
                createdMilestone._id,

              client:
                clientId,

              freelancer:
                proposal.freelancer._id,

              amount:
                createdMilestone.amount,

              clientFee: 0,

              freelancerFee: 0,

              freelancerNetAmount:
                createdMilestone.amount,

              currency: "NGN",

              status: "PENDING",

              provider:
                "PAYSTACK",

              providerReference:
                null,

              providerTransactionId:
                null,

              providerStatus:
                null,

              paidAt: null,

              releasedAt: null,

              refundedAt: null,

              metadata: {},
            },
          ],
          {
            session,
          }
        );

      createdPayment =
        payments[0];

      /*
      ==================================================
      13. CONNECT PAYMENT TO MILESTONE
      ==================================================
      */

      createdMilestone.payment =
        createdPayment._id;

      await createdMilestone.save({
        session,
      });

      /*
      ==================================================
      14. SAVE PAYMENT REFERENCE ON PROJECT
      ==================================================
      */

      createdProject.paymentReference =
        createdPayment.reference;

      await createdProject.save({
        session,
      });

      /*
      ==================================================
      14b. REMAINING MILESTONES FROM THE PAYMENT PLAN
      Created unfunded (PENDING). The client funds each one
      from the workroom, exactly like any other milestone.
      ==================================================
      */

      allMilestones = [createdMilestone];

      if (planDrafts.length > 1) {
        const rest = await Milestone.create(
          planDrafts.slice(1).map((draft) => ({
            project: createdProject._id,
            client: clientId,
            freelancer: proposal.freelancer._id,
            title: draft.title,
            description: draft.description,
            amount: draft.amount,
            currency: "NGN",
            order: draft.order,
            status: "PENDING",
          })),
          {
            session,
            ordered: true,
          }
        );

        allMilestones = [createdMilestone, ...rest];
      }

      /*
      ==================================================
      14b. REMAINING MILESTONES FROM THE PAYMENT PLAN
      Created unfunded (PENDING). The client funds each one
      from the workroom, exactly like any other milestone.
      ==================================================
      */

      allMilestones = [createdMilestone];

      if (planDrafts.length > 1) {
        const rest = await Milestone.create(
          planDrafts.slice(1).map((draft) => ({
            project: createdProject._id,
            client: clientId,
            freelancer: proposal.freelancer._id,
            title: draft.title,
            description: draft.description,
            amount: draft.amount,
            currency: "NGN",
            order: draft.order,
            status: "PENDING",
          })),
          {
            session,
            ordered: true,
          }
        );

        allMilestones = [createdMilestone, ...rest];
      }

      /*
      ==================================================
      15. ACCEPT SELECTED PROPOSAL
      ==================================================
      */

      proposal.status = "ACCEPTED";

      await proposal.save({
        session,
      });

      /*
      ==================================================
      16. REJECT OTHER PENDING PROPOSALS
      ==================================================
      */

      await Proposal.updateMany(
        {
          job: proposal.job._id,

          _id: {
            $ne: proposal._id,
          },

          status: "PENDING",
        },
        {
          $set: {
            status: "REJECTED",
          },
        },
        {
          session,
        }
      );

      /*
      ==================================================
      17. UPDATE JOB
      ==================================================
      */

      await Job.findByIdAndUpdate(
        proposal.job._id,
        {
          $set: {
            status: "IN_PROGRESS",
          },
        },
        {
          session,
          new: true,
        }
      );

      /*
      ==================================================
      18. CREATE PROJECT ACTIVITY
      ==================================================
      */

      await ProjectActivity.create(
        [
          {
            project:
              createdProject._id,

            user:
              clientId,

            type:
              "CONTRACT_CREATED",

            message:
              allMilestones.length > 1
                ? `Proposal accepted. The job's payment plan was applied: ${allMilestones.length} milestones were created and are awaiting payment.`
                : "Proposal accepted. Project, contract, milestone and payment were created and are awaiting payment.",
          },
        ],
        {
          session,
        }
      );
    });

    /*
    ==================================================
    19. RESPONSE
    ==================================================
    */

    emailService.sendProposalAcceptedEmail(
      acceptedProposal.freelancer.email,
      acceptedProposal.freelancer.name,
      acceptedProposal.job.title,
      createdProject?._id
    );

    return res.status(201).json({
      success: true,

      message:
        allMilestones.length > 1
          ? `Proposal accepted. Project, contract and ${allMilestones.length} milestones from the payment plan were created.`
          : "Proposal accepted. Project, contract, milestone and payment created successfully.",

      data: {
        projectId:
          createdProject?._id,

        contractId:
          createdContract?._id,

        milestoneId:
          createdMilestone?._id,

        milestoneIds:
          allMilestones.map(
            (milestone) => milestone._id
          ),

        milestoneCount:
          allMilestones.length,

        paymentId:
          createdPayment?._id,

        paymentReference:
          createdPayment?.reference,

        status:
          "AWAITING_PAYMENT",
      },
    });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
};

/*

REJECT PROPOSAL

*/

const rejectProposal = asyncHandler(
  async (req, res) => {
    const proposal =
      await proposalService.rejectProposal(
        req.params.id,
        req.user._id
      );

    res.status(200).json({
      success: true,

      message:
        "Proposal rejected successfully",

      data: {
        proposal,
      },
    });
  }
);

module.exports = {
  createProposal,
  getJobProposals,
  getMyProposals,
  getClientProposals,
  getProposalById,
  acceptProposal,
  rejectProposal,
};