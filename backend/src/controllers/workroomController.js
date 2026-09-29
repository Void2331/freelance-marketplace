const Project = require("../models/project.js");
const Contract = require("../models/contract.js");
const Milestone = require("../models/milestone.js");
const ProjectActivity = require("../models/projectActivity.js");

const getWorkroom = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
      .populate("client", "name email")
      .populate("freelancer", "name email")
      .populate("job", "title")
      .populate("proposal");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const userId = req.user._id.toString();

    const isParticipant =
      project.client._id.toString() === userId ||
      project.freelancer._id.toString() === userId;

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not part of this project",
      });
    }

    const contract = await Contract.findOne({
      project: project._id,
    });

    const milestones = await Milestone.find({
      project: project._id,
    }).sort({
      order: 1,
    });

    const activities =
      await ProjectActivity.find({
        project: project._id,
      })
        .populate("user", "name")
        .populate("milestone", "title amount status")
        .sort({
          createdAt: -1,
        })
        .limit(50);

    return res.status(200).json({
      success: true,
      data: {
        project,
        contract,
        milestones,
        activities,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWorkroom,
};