const asyncHandler = require("../utils/asyncHandler");
const Project = require("../models/project.js");
const ProjectActivity = require("../models/projectActivity.js");

/*
====================================================
GET MY NOTIFICATIONS
Recent activity across every project the user is the
client or freelancer on. There's no separate
Notification model — this reads the same activity log
the project workroom timeline uses.
====================================================
*/
const getMyNotifications = asyncHandler(async (req, res) => {
  const limit = Math.min(
    Math.max(parseInt(req.query.limit, 10) || 15, 1),
    50
  );

  const myProjects = await Project.find({
    $or: [
      { client: req.user._id },
      { freelancer: req.user._id },
    ],
  }).select("_id");

  const projectIds = myProjects.map((project) => project._id);

  const activities = await ProjectActivity.find({
    project: { $in: projectIds },
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("project", "title")
    .populate("milestone", "title")
    .populate("user", "name");

  res.status(200).json({
    success: true,
    data: { notifications: activities },
  });
});

module.exports = {
  getMyNotifications,
};
