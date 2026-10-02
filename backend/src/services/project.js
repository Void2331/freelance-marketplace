const Project = require("../models/project.js");
const Milestone = require("../models/milestone.js");
const AppError = require("../utils/AppError");


/*

GET USER PROJECTS

*/

const getMyProjects = async (userId, role) => {
  let filter = {};

  if (role === "CLIENT") {
    filter.client = userId;
  }

  if (role === "FREELANCER") {
    filter.freelancer = userId;
  }

  if (role === "ADMIN") {
    filter = {};
  }

  const projects = await Project.find(filter)
    .populate(
      "client",
      "name email avatar"
    )
    .populate(
      "freelancer",
      "name email avatar skills hourlyRate"
    )
    .populate(
      "job",
      "title category budget budgetType deadline status"
    )
    .sort({
      createdAt: -1
    });

  return projects;
};


/*
====================================================
GET PROJECT BY ID
====================================================
*/

const getProjectById = async (
  projectId,
  userId,
  role
) => {
  const project = await Project.findById(
    projectId
  )
    .populate(
      "client",
      "name email avatar bio location"
    )
    .populate(
      "freelancer",
      "name email avatar bio skills hourlyRate"
    )
    .populate(
      "job",
      "title description category skills budget budgetType deadline status"
    )
    .populate(
      "proposal",
      "coverLetter bidAmount estimatedDuration status"
    );

  if (!project) {
    throw new AppError(
      "Project not found",
      404
    );
  }

  /*
    Admin can view every project.
  */
  if (role === "ADMIN") {
    return project;
  }

  const isClient =
    project.client._id.toString() ===
    userId.toString();

  const isFreelancer =
    project.freelancer._id.toString() ===
    userId.toString();

  if (!isClient && !isFreelancer) {
    throw new AppError(
      "You are not authorized to view this project",
      403
    );
  }

  return project;
};


/*
====================================================
UPDATE PROJECT
CLIENT ONLY
====================================================
*/

const updateProject = async (
  projectId,
  clientId,
  updateData
) => {
  const project =
    await Project.findById(projectId);

  if (!project) {
    throw new AppError(
      "Project not found",
      404
    );
  }

  if (
    project.client.toString() !==
    clientId.toString()
  ) {
    throw new AppError(
      "Only the project client can update this project",
      403
    );
  }

  if (project.status !== "IN_PROGRESS") {
    throw new AppError(
      "Only active projects can be updated",
      400
    );
  }

  Object.assign(
    project,
    updateData
  );

  await project.save();

  return project;
};


/*
====================================================
CANCEL PROJECT
CLIENT ONLY
====================================================
*/

const cancelProject = async (
  projectId,
  clientId
) => {
  const project =
    await Project.findById(projectId);

  if (!project) {
    throw new AppError(
      "Project not found",
      404
    );
  }

  if (
    project.client.toString() !==
    clientId.toString()
  ) {
    throw new AppError(
      "Only the project client can cancel this project",
      403
    );
  }

  if (project.status !== "IN_PROGRESS") {
    throw new AppError(
      "Only active projects can be cancelled",
      400
    );
  }

  project.status = "CANCELLED";
  project.cancelledAt = new Date();

  await project.save();

  /*
    Stop unfinished milestones.
    We don't delete them because their
    history should remain available.
  */
  await Milestone.updateMany(
    {
      project: project._id,
      status: {
        $nin: ["APPROVED"]
      }
    },
    {
      $set: {
        status: "REJECTED"
      }
    }
  );

  return project;
};


/*
====================================================
COMPLETE PROJECT
CLIENT ONLY
====================================================
*/

const completeProject = async (
  projectId,
  clientId
) => {
  const project =
    await Project.findById(projectId);

  if (!project) {
    throw new AppError(
      "Project not found",
      404
    );
  }

  if (
    project.client.toString() !==
    clientId.toString()
  ) {
    throw new AppError(
      "Only the project client can complete this project",
      403
    );
  }

  if (project.status !== "IN_PROGRESS") {
    throw new AppError(
      "Only active projects can be completed",
      400
    );
  }

  /*
    A project can only be manually completed
    when all its milestones are approved.
  */
  const totalMilestones =
    await Milestone.countDocuments({
      project: project._id
    });

  const approvedMilestones =
    await Milestone.countDocuments({
      project: project._id,
      status: "RELEASED"
    });

  if (
    totalMilestones === 0
  ) {
    throw new AppError(
      "Project must have at least one milestone",
      400
    );
  }

  if (
    totalMilestones !==
    approvedMilestones
  ) {
    throw new AppError(
      "All milestones must be approved before completing the project",
      400
    );
  }

  project.status = "COMPLETED";
  project.completedAt = new Date();

  await project.save();

  return project;
};


/*
====================================================
ADMIN: GET ALL PROJECTS
====================================================
*/

const getAllProjects = async () => {
  const projects = await Project.find()
    .populate(
      "client",
      "name email"
    )
    .populate(
      "freelancer",
      "name email"
    )
    .populate(
      "job",
      "title status"
    )
    .sort({
      createdAt: -1
    });

  return projects;
};


module.exports = {
  getMyProjects,
  getProjectById,
  updateProject,
  cancelProject,
  completeProject,
  getAllProjects
};