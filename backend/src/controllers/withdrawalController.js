const asyncHandler = require("../utils/asyncHandler");
const withdrawalService = require("../services/withdrawal.js");

/*
====================================================
LIST SUPPORTED BANKS
====================================================
*/
const getBanks = asyncHandler(async (req, res) => {
  const banks = await withdrawalService.listBanks();

  res.status(200).json({
    success: true,
    data: { banks },
  });
});

/*
====================================================
SET UP MY WITHDRAWAL ACCOUNT
====================================================
*/
const setupWithdrawalAccount = asyncHandler(
  async (req, res) => {
    const account =
      await withdrawalService.setupWithdrawalAccount(
        req.user._id,
        req.body
      );

    res.status(200).json({
      success: true,
      message: "Withdrawal account saved successfully",
      data: { account },
    });
  }
);

/*
====================================================
GET MY WITHDRAWAL ACCOUNT
====================================================
*/
const getWithdrawalAccount = asyncHandler(
  async (req, res) => {
    const account =
      await withdrawalService.getWithdrawalAccount(
        req.user._id
      );

    res.status(200).json({
      success: true,
      data: { account },
    });
  }
);

/*
====================================================
REQUEST A WITHDRAWAL
====================================================
*/
const requestWithdrawal = asyncHandler(
  async (req, res) => {
    const withdrawal =
      await withdrawalService.requestWithdrawal(
        req.user._id,
        req.body.amount
      );

    res.status(201).json({
      success: true,
      message: "Withdrawal initiated successfully",
      data: { withdrawal },
    });
  }
);

/*
====================================================
LIST MY WITHDRAWALS
====================================================
*/
const listWithdrawals = asyncHandler(async (req, res) => {
  const withdrawals =
    await withdrawalService.listWithdrawals(
      req.user._id
    );

  res.status(200).json({
    success: true,
    data: { withdrawals },
  });
});

module.exports = {
  getBanks,
  setupWithdrawalAccount,
  getWithdrawalAccount,
  requestWithdrawal,
  listWithdrawals,
};
