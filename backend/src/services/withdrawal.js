const axios = require("axios");
const crypto = require("crypto");
const mongoose = require("mongoose");

const AppError = require("../utils/AppError");

const User = require("../models/user.js");
const Wallet = require("../models/wallet.js");
const WalletTransaction = require("../models/WalletTransaction.js");
const Withdrawal = require("../models/Withdrawal.js");
const WithdrawalAccount = require("../models/WithdrawalAccount.js");
const WebhookEvent = require("../models/WebhookEvent.js");

const MINIMUM_WITHDRAWAL_AMOUNT = 100;

const paystack = axios.create({
  baseURL:
    process.env.PAYSTACK_BASE_URL ||
    "https://api.paystack.co",

  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

/*
====================================================
LIST BANKS (for the frontend's bank picker)
====================================================
*/
const listBanks = async () => {
  const response = await paystack.get(
    "/bank?currency=NGN"
  );

  return response.data.data.map((bank) => ({
    name: bank.name,
    code: bank.code,
  }));
};

/*
====================================================
SET UP / REPLACE A FREELANCER'S WITHDRAWAL ACCOUNT
====================================================
*/
const setupWithdrawalAccount = async (
  freelancerId,
  { bankCode, bankName, accountNumber }
) => {
  /*
   * 1. RESOLVE THE ACCOUNT WITH PAYSTACK
   * Confirms the account number is real and
   * belongs to the bank claimed, and gives us
   * the bank's own name for the account.
   */
  let resolvedAccountName;

  try {
    const resolveResponse = await paystack.get(
      "/bank/resolve",
      {
        params: {
          account_number: accountNumber,
          bank_code: bankCode,
        },
      }
    );

    resolvedAccountName =
      resolveResponse.data.data.account_name;
  } catch (error) {
    console.error(
      "Paystack account resolution error:",
      error.response?.data || error.message
    );

    throw new AppError(
      "Unable to verify this bank account. Please check the account number and bank.",
      400
    );
  }

  /*
   * 2. CREATE A PAYSTACK TRANSFER RECIPIENT
   * This is the token Paystack uses to know
   * where to actually send money later.
   */
  let recipientCode;

  try {
    const recipientResponse = await paystack.post(
      "/transferrecipient",
      {
        type: "nuban",
        name: resolvedAccountName,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: "NGN",
      }
    );

    recipientCode =
      recipientResponse.data.data.recipient_code;
  } catch (error) {
    console.error(
      "Paystack transfer recipient error:",
      error.response?.data || error.message
    );

    throw new AppError(
      "Unable to set up this withdrawal account",
      500
    );
  }

  /*
   * 3. SAVE / REPLACE THE WITHDRAWAL ACCOUNT
   */
  const withdrawalAccount =
    await WithdrawalAccount.findOneAndUpdate(
      { freelancer: freelancerId },
      {
        freelancer: freelancerId,
        bankCode,
        bankName,
        accountNumber,
        accountName: resolvedAccountName,
        recipientCode,
        verified: true,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

  /*
   * 4. MIRROR ONTO THE USER RECORD
   * (Kept in sync purely for display purposes -
   * WithdrawalAccount.recipientCode is the source
   * of truth actually used to move money.)
   */
  await User.findByIdAndUpdate(freelancerId, {
    $set: {
      bankAccount: {
        accountName: resolvedAccountName,
        accountNumber,
        bankCode,
        bankName,
        isVerified: true,
      },
    },
  });

  return withdrawalAccount;
};

/*
====================================================
GET A FREELANCER'S WITHDRAWAL ACCOUNT
(account number masked to the last 4 digits)
====================================================
*/
const getWithdrawalAccount = async (freelancerId) => {
  const account = await WithdrawalAccount.findOne({
    freelancer: freelancerId,
  }).select("+accountNumber");

  if (!account) {
    return null;
  }

  const raw = account.accountNumber || "";

  return {
    _id: account._id,
    bankName: account.bankName,
    bankCode: account.bankCode,
    accountName: account.accountName,
    accountNumberMasked: raw
      ? `••••${raw.slice(-4)}`
      : "",
    verified: account.verified,
  };
};

/*
====================================================
REQUEST A WITHDRAWAL
====================================================
*/
const requestWithdrawal = async (
  freelancerId,
  amount
) => {
  if (amount < MINIMUM_WITHDRAWAL_AMOUNT) {
    throw new AppError(
      `Minimum withdrawal amount is ${MINIMUM_WITHDRAWAL_AMOUNT}`,
      400
    );
  }

  const withdrawalAccount =
    await WithdrawalAccount.findOne({
      freelancer: freelancerId,
    });

  if (!withdrawalAccount || !withdrawalAccount.verified) {
    throw new AppError(
      "Set up a verified withdrawal account before requesting a withdrawal",
      400
    );
  }

  const wallet = await Wallet.findOne({
    user: freelancerId,
  });

  if (!wallet || wallet.availableBalance < amount) {
    throw new AppError(
      "Insufficient available balance",
      400
    );
  }

  const reference = `WD-${freelancerId}-${crypto
    .randomBytes(6)
    .toString("hex")}`;

  /*
   * =====================================
   * STEP 1: DEBIT THE WALLET ATOMICALLY
   * =====================================
   * This is a real DB transaction because
   * it's the only part that touches our
   * own database consistently. The Paystack
   * call happens AFTER this commits, since
   * you should never hold a DB transaction
   * open across an external HTTP call.
   */
  const session = await mongoose.startSession();

  let withdrawal;

  try {
    await session.withTransaction(async () => {
      const balanceBefore = wallet.availableBalance;
      const balanceAfter = balanceBefore - amount;

      wallet.availableBalance = balanceAfter;
      wallet.totalWithdrawn =
        (wallet.totalWithdrawn || 0) + amount;

      await wallet.save({ session });

      const created = await Withdrawal.create(
        [
          {
            freelancer: freelancerId,
            withdrawalAccount: withdrawalAccount._id,
            amount,
            reference,
            status: "PENDING",
          },
        ],
        { session }
      );

      withdrawal = created[0];

      await WalletTransaction.create(
        [
          {
            wallet: wallet._id,
            user: freelancerId,
            type: "WITHDRAWAL",
            balanceType: "AVAILABLE",
            direction: "DEBIT",
            amount,
            balanceBefore,
            balanceAfter,
            withdrawal: withdrawal._id,
            reference: `WITHDRAWAL-${withdrawal._id}`,
            description: "Withdrawal requested",
          },
        ],
        { session }
      );
    });
  } finally {
    await session.endSession();
  }

  /*
   * =====================================
   * STEP 2: INITIATE THE PAYSTACK TRANSFER
   * =====================================
   * If this fails, reverse the debit we
   * just committed.
   */
  try {
    const transferResponse = await paystack.post(
      "/transfer",
      {
        source: "balance",
        amount: Math.round(amount * 100),
        recipient: withdrawalAccount.recipientCode,
        reason: "Freelance marketplace withdrawal",
        reference,
      }
    );

    withdrawal.status = "PROCESSING";
    withdrawal.paystackTransferCode =
      transferResponse.data.data.transfer_code;

    await withdrawal.save();

    return withdrawal;
  } catch (error) {
    console.error(
      "Paystack transfer initiation error:",
      error.response?.data || error.message
    );

    await reverseWithdrawal(
      withdrawal,
      error.response?.data?.message ||
        "Unable to initiate transfer"
    );

    throw new AppError(
      "Unable to initiate withdrawal. Your balance has been refunded.",
      500
    );
  }
};

/*
====================================================
REVERSE A WITHDRAWAL
(refunds the wallet and marks it FAILED - used both
when the initial Paystack call fails synchronously,
and when a transfer.failed/transfer.reversed webhook
arrives later)
====================================================
*/
const reverseWithdrawal = async (
  withdrawal,
  reason
) => {
  if (
    !["PENDING", "PROCESSING"].includes(
      withdrawal.status
    )
  ) {
    /*
     * Already finalized - nothing to reverse.
     * Keeps this idempotent if a webhook fires
     * more than once.
     */
    return withdrawal;
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const wallet = await Wallet.findOne({
        user: withdrawal.freelancer,
      }).session(session);

      if (wallet) {
        const balanceBefore = wallet.availableBalance;
        const balanceAfter =
          balanceBefore + withdrawal.amount;

        wallet.availableBalance = balanceAfter;
        wallet.totalWithdrawn = Math.max(
          0,
          (wallet.totalWithdrawn || 0) -
            withdrawal.amount
        );

        await wallet.save({ session });

        await WalletTransaction.create(
          [
            {
              wallet: wallet._id,
              user: withdrawal.freelancer,
              type: "REVERSAL",
              balanceType: "AVAILABLE",
              direction: "CREDIT",
              amount: withdrawal.amount,
              balanceBefore,
              balanceAfter,
              withdrawal: withdrawal._id,
              reference: `WITHDRAWAL-REVERSAL-${withdrawal._id}`,
              description: `Withdrawal reversed: ${reason}`,
            },
          ],
          { session }
        );
      }

      withdrawal.status = "FAILED";
      withdrawal.failureReason = reason;
      withdrawal.processedAt = new Date();

      await withdrawal.save({ session });
    });
  } finally {
    await session.endSession();
  }

  return withdrawal;
};

/*
====================================================
LIST A FREELANCER'S WITHDRAWALS
====================================================
*/
const listWithdrawals = async (freelancerId) => {
  const withdrawals = await Withdrawal.find({
    freelancer: freelancerId,
  }).sort({ createdAt: -1 });

  return withdrawals;
};

/*
====================================================
PROCESS A PAYSTACK TRANSFER WEBHOOK EVENT
Called from the shared Paystack webhook handler for
transfer.success / transfer.failed / transfer.reversed
====================================================
*/
const processTransferWebhookEvent = async (
  eventName,
  data,
  rawEvent
) => {
  const reference = data.reference;

  if (!reference) {
    return;
  }

  const existingEvent = await WebhookEvent.findOne({
    reference,
    event: eventName,
    processed: true,
  });

  if (existingEvent) {
    return;
  }

  const withdrawal = await Withdrawal.findOne({
    reference,
  });

  if (!withdrawal) {
    return;
  }

  if (eventName === "transfer.success") {
    if (withdrawal.status !== "SUCCESS") {
      withdrawal.status = "SUCCESS";
      withdrawal.processedAt = new Date();

      if (data.transfer_code) {
        withdrawal.paystackTransferCode =
          data.transfer_code;
      }

      await withdrawal.save();
    }
  } else if (
    eventName === "transfer.failed" ||
    eventName === "transfer.reversed"
  ) {
    await reverseWithdrawal(
      withdrawal,
      data.reason ||
        `Paystack reported ${eventName}`
    );
  }

  await WebhookEvent.create({
    eventId:
      data.id || `${eventName}-${reference}`,
    event: eventName,
    reference,
    processed: true,
    processedAt: new Date(),
    payload: rawEvent,
  });
};

module.exports = {
  listBanks,
  setupWithdrawalAccount,
  getWithdrawalAccount,
  requestWithdrawal,
  listWithdrawals,
  processTransferWebhookEvent,
};
