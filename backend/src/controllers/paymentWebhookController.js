const mongoose = require("mongoose");

const Payment = require("../models/Payment.js");
const WebhookEvent = require("../models/WebhookEvent.js");
const Project = require("../models/project.js");
const Milestone = require("../models/milestone.js");
const Contract = require("../models/contract.js");
const Wallet = require("../models/wallet.js");
const WalletTransaction = require("../models/WalletTransaction.js");
const ProjectActivity = require("../models/projectActivity.js");

const {
  verifyPaystackSignature,
} = require("../services/paymentWebhook.js");

const withdrawalService = require("../services/withdrawal.js");

const handlePaystackWebhook = async (req, res) => {
  try {
    /*
     * 1. VERIFY PAYSTACK SIGNATURE
     */
    const validSignature =
      verifyPaystackSignature(req);

    if (!validSignature) {
      return res.status(401).json({
        success: false,
        message: "Invalid Paystack signature",
      });
    }

    /*
     * 2. GET WEBHOOK PAYLOAD
     */
    const event = req.body;

    const eventName = event.event;
    const data = event.data;

    if (!eventName || !data) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook payload",
      });
    }

    /*
     * 3. HANDLE WITHDRAWAL TRANSFER EVENTS
     * SEPARATELY - these settle a Withdrawal,
     * not a Payment.
     */
    if (
      eventName === "transfer.success" ||
      eventName === "transfer.failed" ||
      eventName === "transfer.reversed"
    ) {
      await withdrawalService.processTransferWebhookEvent(
        eventName,
        data,
        event
      );

      return res.status(200).json({
        success: true,
        message: "Transfer event processed",
      });
    }

    /*
     * 4. OTHERWISE WE ONLY PROCESS
     * SUCCESSFUL PAYMENTS
     */
    if (eventName !== "charge.success") {
      return res.status(200).json({
        success: true,
        message: "Event received",
      });
    }

    /*
     * 4. GET PAYSTACK REFERENCE
     */
    const providerReference =
      data.reference;

    if (!providerReference) {
      return res.status(400).json({
        success: false,
        message: "Payment reference missing",
      });
    }

    /*
     * 5. CHECK IF THIS WEBHOOK WAS ALREADY PROCESSED
     */
    const existingEvent =
      await WebhookEvent.findOne({
        reference: providerReference,
        event: eventName,
        processed: true,
      });

    if (existingEvent) {
      return res.status(200).json({
        success: true,
        message: "Webhook already processed",
      });
    }

    /*
     * 6. FIND PAYMENT USING PAYSTACK REFERENCE
     *
     * IMPORTANT:
     * Paystack reference is stored in
     * Payment.providerReference
     */
    const payment =
      await Payment.findOne({
        providerReference,
      });

    if (!payment) {
      /*
       * Do not keep retrying a payment that
       * does not belong to this marketplace.
       */
      return res.status(200).json({
        success: true,
        message:
          "Payment not found in marketplace",
      });
    }

    /*
     * 7. VERIFY THE AMOUNT
     *
     * Payment.amount = milestone amount
     * Payment.clientFee = fee paid by client
     *
     * Paystack receives:
     *
     * amount + clientFee
     *
     * multiplied by 100 because Paystack
     * expects kobo.
     */
    const expectedAmount = Math.round(
      (payment.amount +
        payment.clientFee) *
        100
    );

    if (
      Number(data.amount) !==
      Number(expectedAmount)
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment amount mismatch",
      });
    }

    /*
     * 8. VERIFY CURRENCY
     */
    if (
      data.currency &&
      String(data.currency).toUpperCase() !==
        String(payment.currency).toUpperCase()
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment currency mismatch",
      });
    }

    /*
     * 9. IDEMPOTENCY CHECK
     *
     * FUNDED means the payment has already
     * been confirmed.
     *
     * RELEASED also means it was already
     * successfully processed.
     */
    if (
      payment.status === "FUNDED" ||
      payment.status === "RELEASED"
    ) {
      return res.status(200).json({
        success: true,
        message:
          "Payment already processed",
      });
    }

    /*
     * 10. FIND MILESTONE
     */
    const milestone =
      await Milestone.findById(
        payment.milestone
      );

    if (!milestone) {
      return res.status(200).json({
        success: true,
        message:
          "Milestone not found",
      });
    }

    /*
     * 11. FIND PROJECT
     */
    const project =
      await Project.findById(
        payment.project
      );

    if (!project) {
      return res.status(200).json({
        success: true,
        message:
          "Project not found",
      });
    }

    /*
     * 12. START DATABASE TRANSACTION
     */
    const session =
      await mongoose.startSession();

    try {
      await session.withTransaction(
        async () => {
          const now = new Date();

          /*
           * =====================================
           * PAYMENT
           * =====================================
           */
          payment.status = "FUNDED";

          payment.providerTransactionId =
            data.id
              ? String(data.id)
              : null;

          payment.providerStatus =
            data.status || "success";

          payment.paidAt =
            data.paid_at
              ? new Date(data.paid_at)
              : now;

          await payment.save({
            session,
          });

          /*
           * =====================================
           * MILESTONE
           * =====================================
           *
           * PENDING -> FUNDED
           */
          if (
            milestone.status === "PENDING" ||
            milestone.status ===
              "REVISION_REQUESTED"
          ) {
            milestone.status = "FUNDED";

            await milestone.save({
              session,
            });
          }

          /*
           * =====================================
           * PROJECT
           * =====================================
           *
           * First successful payment activates
           * the project.
           */
          project.funded = true;

          if (!project.fundedAt) {
            project.fundedAt = now;
          }

          project.status = "IN_PROGRESS";

          /*
           * IMPORTANT:
           * startedAt is set when the first payment
           * is confirmed, NOT when proposal is accepted.
           */
          if (!project.startedAt) {
            project.startedAt = now;
          }

          await project.save({
            session,
          });

          /*
           * =====================================
           * CONTRACT
           * =====================================
           *
           * PENDING_PAYMENT -> ACTIVE
           */
          const contract =
            await Contract.findOne({
              project: payment.project,
            }).session(session);

          if (contract) {
            if (
              contract.status ===
              "PENDING_PAYMENT"
            ) {
              contract.status = "ACTIVE";
            }

            /*
             * Only set startedAt once.
             */
            if (!contract.startedAt) {
              contract.startedAt = now;
            }

            await contract.save({
              session,
            });
          }

          /*
           * =====================================
           * FREELANCER WALLET
           * =====================================
           *
           * IMPORTANT:
           *
           * The freelancer has NOT earned
           * available money yet.
           *
           * The money is held in pendingBalance
           * until the client approves the milestone.
           */
          let wallet =
            await Wallet.findOne({
              user: payment.freelancer,
            }).session(session);

          if (!wallet) {
            const wallets =
              await Wallet.create(
                [
                  {
                    user:
                      payment.freelancer,
                    pendingBalance: 0,
                    availableBalance: 0,
                    totalEarned: 0,
                    totalWithdrawn: 0,
                    currency:
                      payment.currency,
                  },
                ],
                {
                  session,
                }
              );

            wallet = wallets[0];
          }

          /*
           * =====================================
           * WALLET TRANSACTION IDEMPOTENCY
           * =====================================
           */
          const walletReference =
            `PAYMENT-FUNDED-${payment._id}`;

          const existingWalletTransaction =
            await WalletTransaction.findOne({
              reference:
                walletReference,
            }).session(session);

          if (!existingWalletTransaction) {
            const balanceBefore =
              wallet.pendingBalance;

            const balanceAfter =
              balanceBefore +
              payment.freelancerNetAmount;

            wallet.pendingBalance =
              balanceAfter;

            await wallet.save({
              session,
            });

            /*
             * Record pending earnings.
             */
            await WalletTransaction.create(
              [
                {
                  wallet: wallet._id,

                  user:
                    payment.freelancer,

                  type:
                    "MILESTONE_EARNING",

                  balanceType:
                    "PENDING",

                  direction:
                    "CREDIT",

                  amount:
                    payment.freelancerNetAmount,

                  balanceBefore,

                  balanceAfter,

                  project:
                    payment.project,

                  milestone:
                    payment.milestone,

                  payment:
                    payment._id,

                  reference:
                    walletReference,

                  description:
                    `Pending earnings funded for milestone "${milestone.title}"`,
                },
              ],
              {
                session,
              }
            );
          }

          /*
           * =====================================
           * PROJECT ACTIVITY
           * =====================================
           */
          await ProjectActivity.create(
            [
              {
                project:
                  payment.project,

                user:
                  payment.client,

                type:
                  "PAYMENT_FUNDED",

                milestone:
                  payment.milestone,

                message:
                  "Client payment confirmed. The milestone is funded and the project is now in progress.",

                metadata: {
                  paymentId:
                    payment._id,

                  providerReference:
                    payment.providerReference,

                  providerTransactionId:
                    payment.providerTransactionId,

                  amount:
                    payment.amount,

                  clientFee:
                    payment.clientFee,

                  freelancerNetAmount:
                    payment.freelancerNetAmount,

                  currency:
                    payment.currency,
                },
              },
            ],
            {
              session,
            }
          );

          /*
           * =====================================
           * RECORD WEBHOOK EVENT
           * =====================================
           */
          await WebhookEvent.create(
            [
              {
                eventId:
                  data.id ||
                  `${eventName}-${providerReference}`,

                event:
                  eventName,

                reference:
                  providerReference,

                processed: true,

                processedAt: now,

                payload: event,
              },
            ],
            {
              session,
            }
          );
        }
      );
    } finally {
      await session.endSession();
    }

    /*
     * 13. TELL PAYSTACK WE SUCCESSFULLY
     * RECEIVED AND PROCESSED THE EVENT
     */
    return res.status(200).json({
      success: true,
      message:
        "Payment processed successfully",
    });
  } catch (error) {
    console.error(
      "Paystack webhook error:",
      error
    );

    /*
     * Returning 500 is intentional.
     *
     * If our database processing failed,
     * Paystack can retry the webhook.
     */
    return res.status(500).json({
      success: false,
      message:
        "Webhook processing failed",
    });
  }
};

module.exports = {
  handlePaystackWebhook,
};