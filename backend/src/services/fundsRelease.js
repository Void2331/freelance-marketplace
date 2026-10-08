const Wallet = require("../models/wallet.js");
const WalletTransaction = require("../models/WalletTransaction.js");
const AppError = require("../utils/AppError");

/*
====================================================
FUNDS RELEASE HELPERS
Shared by dispute settlement and milestone
auto-approval. Every balance change is a single
atomic $inc guarded by a balance check, so two
requests can never spend the same money.
All functions must be called inside a Mongo
transaction (pass the session).
====================================================
*/

const round2 = (value) => Math.round(value * 100) / 100;

/*
 * Moves `amount` from pending -> available.
 */
const releasePendingToAvailable = async ({
  freelancerId,
  amount,
  project,
  milestone,
  payment,
  reference,
  description,
  session,
}) => {
  if (amount <= 0) return null;

  const wallet = await Wallet.findOneAndUpdate(
    { user: freelancerId, pendingBalance: { $gte: amount } },
    {
      $inc: {
        pendingBalance: -amount,
        availableBalance: amount,
        totalEarned: amount,
      },
    },
    { new: true, session }
  );

  if (!wallet) {
    throw new AppError(
      "Insufficient pending wallet balance",
      409
    );
  }

  await WalletTransaction.create(
    [
      {
        wallet: wallet._id,
        user: freelancerId,
        type: "MILESTONE_EARNING",
        balanceType: "AVAILABLE",
        direction: "CREDIT",
        amount,
        balanceBefore: wallet.availableBalance - amount,
        balanceAfter: wallet.availableBalance,
        project,
        milestone,
        payment,
        reference,
        description,
      },
    ],
    { session }
  );

  return wallet;
};

/*
 * Removes `amount` from the freelancer's pending
 * balance because it is being refunded to the client.
 */
const removeFromPending = async ({
  freelancerId,
  amount,
  project,
  milestone,
  payment,
  reference,
  description,
  session,
}) => {
  if (amount <= 0) return null;

  const wallet = await Wallet.findOneAndUpdate(
    { user: freelancerId, pendingBalance: { $gte: amount } },
    { $inc: { pendingBalance: -amount } },
    { new: true, session }
  );

  if (!wallet) {
    throw new AppError(
      "Insufficient pending wallet balance",
      409
    );
  }

  await WalletTransaction.create(
    [
      {
        wallet: wallet._id,
        user: freelancerId,
        type: "REFUND",
        balanceType: "PENDING",
        direction: "DEBIT",
        amount,
        balanceBefore: wallet.pendingBalance + amount,
        balanceAfter: wallet.pendingBalance,
        project,
        milestone,
        payment,
        reference,
        description,
      },
    ],
    { session }
  );

  return wallet;
};

module.exports = {
  round2,
  releasePendingToAvailable,
  removeFromPending,
};
