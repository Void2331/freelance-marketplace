const Contract = require("../models/contract.js");

const getMyContracts = async (req, res, next) => {
  try {
    const contracts = await Contract.find({
      freelancer: req.user._id,
    })
      .populate("client", "name email")
      .populate({
        path: "project",
        populate: [
          {
            path: "job",
            select: "title",
          },
        ],
      })
      .populate({
        path: "proposal",
        select: "bidAmount estimatedDuration coverLetter",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        contracts,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMyContract = async (req, res, next) => {
  try {
    const { id } = req.params;

    const contract = await Contract.findOne({
      _id: id,
      freelancer: req.user._id,
    })
      .populate("client", "name email")
      .populate({
        path: "project",
        populate: [
          {
            path: "job",
            select: "title description category",
          },
        ],
      })
      .populate("proposal");

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: "Contract not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        contract,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyContracts,
  getMyContract,
};