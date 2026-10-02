const asyncHandler =
  require("../utils/asyncHandler");

const {
  getOrCreateWallet
} = require("../services/wallet.js");

const getWallet =
  asyncHandler(
    async (req, res) => {
      const wallet =
        await getOrCreateWallet(
          req.user._id
        );

      res.status(200).json({
        success: true,
        data: {
          wallet
        }
      });
    }
  );

module.exports = {
  getWallet
};