const mongoose = require("mongoose");

const Milestone = require("../models/milestone.js");
const Payment = require("../models/Payment.js");
const Wallet = require("../models/wallet.js");
const WalletTransaction = require("../models/WalletTransaction.js");
const MilestoneSubmission = require("../models/milestoneSubmission.js");
const ProjectActivity = require("../models/projectActivity.js");

const {
  checkProjectCompletion,
} = require("../services/projectCompletion.js");

const approveMilestone = async (
  req,
  res,
  next
) => {
  const session = await mongoose.startSession();

  try {
    const { milestoneId } = req.params;

    await session.withTransaction(
      async () => {
        /*
         * Find milestone
         */

        const milestone =
          await Milestone.findById(
            milestoneId
          ).session(session);

        if (!milestone) {
          throw new Error(
            "Milestone not found"
          );
        }

        /*
         * Only the client can
         * approve the milestone.
         */

        if (
          milestone.client.toString() !==
          req.user._id.toString()
        ) {
          throw new Error(
            "Only the client can approve this milestone"
          );
        }

        /*
         * Milestone must be
         * awaiting approval.
         */

        if (
          milestone.status !==
          "SUBMITTED"
        ) {
          throw new Error(
            "Milestone is not awaiting approval"
          );
        }

        /*
         * Find pending submission
         */

        const submission =
          await MilestoneSubmission.findOne(
            {
              milestone:
                milestone._id,

              status:
                "PENDING_REVIEW",
            }
          )
            .sort({
              createdAt: -1,
            })
            .session(session);

        if (!submission) {
          throw new Error(
            "No pending submission found"
          );
        }

        /*
         * Find funded payment
         */

        const payment =
          await Payment.findOne({
            milestone:
              milestone._id,

            status: "FUNDED",
          }).session(session);

        if (!payment) {
          throw new Error(
            "Funded payment not found"
          );
        }

        /*
         * Get freelancer wallet
         */

        let wallet =
          await Wallet.findOne({
            user:
              milestone.freelancer,
          }).session(session);

        /*
         * Create wallet if it
         * does not exist.
         */

        if (!wallet) {
          const wallets =
            await Wallet.create(
              [
                {
                  user:
                    milestone.freelancer,
                },
              ],
              {
                session,
              }
            );

          wallet = wallets[0];
        }

        /*
         * Calculate freelancer
         * net earnings.
         */

        const netAmount =
          payment.freelancerNetAmount ||
          payment.amount;

        /*
         * Verify pending balance.
         */

        if (
          wallet.pendingBalance <
          netAmount
        ) {
          throw new Error(
            "Insufficient pending wallet balance"
          );
        }

        /*
         * Capture balance before
         * releasing funds.
         */

        const balanceBefore =
          wallet.availableBalance;

        /*
         * Move money from
         * pending to available.
         */

        wallet.pendingBalance -=
          netAmount;

        wallet.availableBalance +=
          netAmount;

        wallet.totalEarned +=
          netAmount;

        await wallet.save({
          session,
        });

        /*
         * Create wallet ledger
         * transaction.
         */

        await WalletTransaction.create(
          [
            {
              wallet:
                wallet._id,

              user:
                milestone.freelancer,

              type:
                "MILESTONE_EARNING",

              balanceType:
                "AVAILABLE",

              direction:
                "CREDIT",

              amount:
                netAmount,

              balanceBefore,

              balanceAfter:
                wallet.availableBalance,

              project:
                milestone.project,

              milestone:
                milestone._id,

              payment:
                payment._id,

              reference:
                `earning-${milestone._id}-${Date.now()}`,

              description:
                `Earnings released for milestone: ${milestone.title}`,
            },
          ],
          {
            session,
          }
        );

        /*
         * Update payment.
         */

        payment.status =
          "RELEASED";

        payment.releasedAt =
          new Date();

        await payment.save({
          session,
        });

        /*
         * Update milestone.
         */

        milestone.status =
          "RELEASED";

        milestone.approvedAt =
          new Date();

        milestone.releasedAt =
          new Date();

        await milestone.save({
          session,
        });

        /*
         * Check whether all
         * project milestones
         * have been released.
         */

        await checkProjectCompletion(
          milestone.project,
          session
        );

        /*
         * Update submission.
         */

        submission.status =
          "APPROVED";

        submission.reviewedAt =
          new Date();

        await submission.save({
          session,
        });

        /*
         * Create project activity.
         */

        await ProjectActivity.create(
          [
            {
              project:
                milestone.project,

              user:
                req.user._id,

              type:
                "MILESTONE_APPROVED",

              message:
                "Client approved the milestone and payment was released.",

              milestone:
                milestone._id,
            },
          ],
          {
            session,
          }
        );
      }
    );

    return res.status(200).json({
      success: true,
      message:
        "Milestone approved and payment released",
    });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
};

module.exports = {
  approveMilestone,
};
