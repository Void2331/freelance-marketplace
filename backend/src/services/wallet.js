const Wallet = require("../models/wallet.js");

/*
  NOTE: this file previously also exported
  creditFreelancer/debitWallet, which wrote to the
  legacy Transaction model and bypassed the
  pendingBalance/availableBalance split entirely.
  That whole path was dead code (gated on a
  milestone status nothing ever set) and has been
  removed. Milestone payouts go through
  milestoneApprovalController.js, and withdrawals
  through services/withdrawal.js - both use Wallet +
  WalletTransaction directly, inside a real DB
  transaction.
*/

const getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({
    user: userId
  });

  if (!wallet) {
    wallet = await Wallet.create({
      user: userId
    });
  }

  return wallet;
};

module.exports = {
  getOrCreateWallet
};
