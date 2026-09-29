const Milestone = require("../models/milestone.js");
const Project = require("../models/project.js");
const Contract = require("../models/contract.js");
const ProjectActivity = require("../models/projectActivity.js");

const checkProjectCompletion =
  async (projectId, session) => {
    const remaining =
      await Milestone.countDocuments({
        project: projectId,

        status: {
          $nin: [
            "RELEASED",
            "CANCELLED",
          ],
        },
      }).session(session);

    if (remaining > 0) {
      return false;
    }

    await Project.findByIdAndUpdate(
      projectId,
      {
        $set: {
          status: "COMPLETED",

          completedAt:
            new Date(),
        },
      },
      {
        session,
      }
    );

    await Contract.findOneAndUpdate(
      {
        project: projectId,
      },
      {
        $set: {
          status: "COMPLETED",

          completedAt:
            new Date(),
        },
      },
      {
        session,
      }
    );

    await ProjectActivity.create(
      [
        {
          project: projectId,

          user: null,

          type:
            "PROJECT_COMPLETED",

          message:
            "All project milestones have been completed.",
        },
      ],
      { session }
    );

    return true;
  };

module.exports = {
  checkProjectCompletion,
};