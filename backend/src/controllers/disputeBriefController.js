const asyncHandler = require("../utils/asyncHandler");
const { generateAndSaveBrief } = require("../services/disputeBriefing");

/*
====================================================
POST /api/disputes/:disputeId/brief   (ADMIN)
Generates (or regenerates) the AI briefing and saves it
on the dispute. It never changes the dispute's status or
touches any money.
====================================================
*/
const generateDisputeBrief = asyncHandler(async (req, res) => {
  const brief = await generateAndSaveBrief(
    req.params.disputeId,
    req.user._id
  );

  res.status(200).json({
    success: true,
    data: { brief },
  });
});

module.exports = { generateDisputeBrief };
