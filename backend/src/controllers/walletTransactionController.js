const WalletTransaction = require("../models/WalletTransaction");


const getMyWalletTransactions = async (req, res, next) => {
  try {
    const transactions = await WalletTransaction.find({
      user: req.user._id,
    })
      .populate("project", "title")
      .populate("milestone", "title amount")
      .populate("payment", "amount currency status")
      .populate("withdrawal", "amount status reference")
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      data: {
        transactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyWalletTransactions,
};