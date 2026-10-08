const asyncHandler = require("../utils/asyncHandler");
const {
  generateMilestonePlan,
} = require("../services/milestonePlanner");

/*
====================================================
POST /api/ai/milestone-plan
Returns a DRAFT plan. Nothing is saved here: the client
edits the draft and it is stored with the job when they
post it.
====================================================
*/
const suggestMilestonePlan = asyncHandler(async (req, res) => {
  const milestones = await generateMilestonePlan(req.body);

  res.status(200).json({
    success: true,
    data: { milestones },
  });
});

module.exports = { suggestMilestonePlan };
