const Milestone = require("../models/milestone.js");
const Project = require("../models/project.js");
const AppError = require("../utils/AppError");


/*
====================================================
 GET PROJECT AND CHECK ACCESS
====================================================
*/

const getProjectForUser = async (
  projectId,
  userId
) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new AppError(
      "Project not found",
      404
    );
  }

  const isClient =
    project.client.toString() ===
    userId.toString();

  const isFreelancer =
    project.freelancer.toString() ===
    userId.toString();

  if (!isClient && !isFreelancer) {
    throw new AppError(
      "You are not authorized to access this project",
      403
    );
  }

  return {
    project,
    isClient,
    isFreelancer
  };
};


/*
====================================================
CREATE MILESTONE
CLIENT ONLY
====================================================
*/

const createMilestone = async (
  projectId,
  clientId,
  milestoneData
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
      "Only the project client can create milestones",
      403
    );
  }

  if (project.status !== "IN_PROGRESS") {
    throw new AppError(
      "Milestones can only be created for active projects",
      400
    );
  }

  const dueDate = new Date(
    milestoneData.dueDate
  );

  if (dueDate <= new Date()) {
    throw new AppError(
      "Milestone due date must be in the future",
      400
    );
  }

  /*
    Calculate current milestone total.
  */
  const existingMilestones =
    await Milestone.find({
      project: projectId
    });

  const currentTotal =
    existingMilestones.reduce(
      (total, milestone) =>
        total + milestone.amount,
      0
    );

  /*
    Prevent milestones from exceeding
    project budget.
  */
  if (
    currentTotal + milestoneData.amount >
    project.totalAmount
  ) {
    throw new AppError(
      "Milestone amount exceeds the remaining project budget",
      400
    );
  }

  const milestone =
    await Milestone.create({
      project: projectId,
      ...milestoneData,
      dueDate
    });

  return milestone;
};


/*
====================================================
GET PROJECT MILESTONES
====================================================
*/

const getProjectMilestones = async (
  projectId,
  userId
) => {
  await getProjectForUser(
    projectId,
    userId
  );

  const milestones =
    await Milestone.find({
      project: projectId
    }).sort({
      dueDate: 1
    });

  return milestones;
};


/*
====================================================
GET SINGLE MILESTONE
====================================================
*/

const getMilestoneById = async (
  milestoneId,
  userId
) => {
  const milestone =
    await Milestone.findById(
      milestoneId
    ).populate(
      "project",
      "title client freelancer budget status"
    );

  if (!milestone) {
    throw new AppError(
      "Milestone not found",
      404
    );
  }

  const project =
    milestone.project;

  const isClient =
    project.client.toString() ===
    userId.toString();

  const isFreelancer =
    project.freelancer.toString() ===
    userId.toString();

  if (!isClient && !isFreelancer) {
    throw new AppError(
      "You are not authorized to view this milestone",
      403
    );
  }

  return milestone;
};


/*
====================================================
UPDATE MILESTONE
CLIENT ONLY
====================================================
*/

const updateMilestone = async (
  milestoneId,
  clientId,
  updateData
) => {
  const milestone =
    await Milestone.findById(
      milestoneId
    );

  if (!milestone) {
    throw new AppError(
      "Milestone not found",
      404
    );
  }

  const project =
    await Project.findById(
      milestone.project
    );

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
      "Only the project client can update milestones",
      403
    );
  }

  if (
    milestone.status === "APPROVED"
  ) {
    throw new AppError(
      "Approved milestones cannot be updated",
      400
    );
  }

  if (updateData.dueDate) {
    const dueDate = new Date(
      updateData.dueDate
    );

    if (dueDate <= new Date()) {
      throw new AppError(
        "Milestone due date must be in the future",
        400
      );
    }

    updateData.dueDate = dueDate;
  }

  /*
    If amount changes, check the
    project budget again.
  */
  if (
    updateData.amount !== undefined
  ) {
    const otherMilestones =
      await Milestone.find({
        project: project._id,
        _id: {
          $ne: milestone._id
        }
      });

    const otherTotal =
      otherMilestones.reduce(
        (total, item) =>
          total + item.amount,
        0
      );

    if (
      otherTotal +
        updateData.amount >
      project.budget
    ) {
      throw new AppError(
        "Milestone amount exceeds the project budget",
        400
      );
    }
  }

  Object.assign(
    milestone,
    updateData
  );

  await milestone.save();

  return milestone;
};


/*
====================================================
DELETE MILESTONE
CLIENT ONLY
====================================================
*/

const deleteMilestone = async (
  milestoneId,
  clientId
) => {
  const milestone =
    await Milestone.findById(
      milestoneId
    );

  if (!milestone) {
    throw new AppError(
      "Milestone not found",
      404
    );
  }

  const project =
    await Project.findById(
      milestone.project
    );

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
      "Only the project client can delete milestones",
      403
    );
  }

  if (
    milestone.status === "SUBMITTED" ||
    milestone.status === "APPROVED"
  ) {
    throw new AppError(
      "Submitted or approved milestones cannot be deleted",
      400
    );
  }

  await milestone.deleteOne();

  return true;
};


/*
====================================================
START MILESTONE
FREELANCER ONLY
====================================================
*/

const startMilestone = async (
  milestoneId,
  freelancerId
) => {
  const milestone =
    await Milestone.findById(
      milestoneId
    );

  if (!milestone) {
    throw new AppError(
      "Milestone not found",
      404
    );
  }

  const project =
    await Project.findById(
      milestone.project
    );

  if (!project) {
    throw new AppError(
      "Project not found",
      404
    );
  }

  if (
    project.freelancer.toString() !==
    freelancerId.toString()
  ) {
    throw new AppError(
      "Only the assigned freelancer can start this milestone",
      403
    );
  }

  if (
    milestone.status !== "PENDING" &&
    milestone.status !== "REJECTED"
  ) {
    throw new AppError(
      "This milestone cannot be started",
      400
    );
  }

  milestone.status = "IN_PROGRESS";

  await milestone.save();

  return milestone;
};


/*
====================================================
SUBMIT MILESTONE
FREELANCER ONLY
====================================================
*/

const submitMilestone = async (
  milestoneId,
  freelancerId,
  submission
) => {
  const milestone =
    await Milestone.findById(
      milestoneId
    );

  if (!milestone) {
    throw new AppError(
      "Milestone not found",
      404
    );
  }

  const project =
    await Project.findById(
      milestone.project
    );

  if (!project) {
    throw new AppError(
      "Project not found",
      404
    );
  }

  if (
    project.freelancer.toString() !==
    freelancerId.toString()
  ) {
    throw new AppError(
      "Only the assigned freelancer can submit this milestone",
      403
    );
  }

  if (
    milestone.status !== "IN_PROGRESS"
  ) {
    throw new AppError(
      "Only milestones in progress can be submitted",
      400
    );
  }

  milestone.submissionNote =
    submission;

  milestone.status = "SUBMITTED";

  milestone.submittedAt =
    new Date();

  await milestone.save();

  return milestone;
};


/*
====================================================
APPROVE MILESTONE
CLIENT ONLY
====================================================
*/

const approveMilestone = async (
  milestoneId,
  clientId
) => {
  const milestone =
    await Milestone.findById(
      milestoneId
    );

  if (!milestone) {
    throw new AppError(
      "Milestone not found",
      404
    );
  }

  const project =
    await Project.findById(
      milestone.project
    );

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
      "Only the project client can approve milestones",
      403
    );
  }

  if (
    milestone.status !== "SUBMITTED"
  ) {
    throw new AppError(
      "Only submitted milestones can be approved",
      400
    );
  }

  milestone.status = "APPROVED";

  milestone.completedAt =
    new Date();

  await milestone.save();

  /*
    Check whether every milestone
    has been approved.
  */
 const total =
  await Milestone.countDocuments({
    project: project._id
  });

const remaining =
  await Milestone.countDocuments({
    project: project._id,
    status: {
      $ne: "APPROVED"
    }
  });

if (
  project.status === "IN_PROGRESS" &&
  total > 0 &&
  remaining === 0
) {
  project.status = "COMPLETED";
  project.completedAt = new Date();

  await project.save();
}

  return milestone;
};


/*
====================================================
REJECT MILESTONE
CLIENT ONLY
====================================================
*/

const rejectMilestone = async (
  milestoneId,
  clientId
) => {
  const milestone =
    await Milestone.findById(
      milestoneId
    );

  if (!milestone) {
    throw new AppError(
      "Milestone not found",
      404
    );
  }

  const project =
    await Project.findById(
      milestone.project
    );

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
      "Only the project client can reject milestones",
      403
    );
  }

  if (
    milestone.status !== "SUBMITTED"
  ) {
    throw new AppError(
      "Only submitted milestones can be rejected",
      400
    );
  }

  milestone.status = "REJECTED";

  await milestone.save();

  return milestone;
};


module.exports = {
  createMilestone,
  getProjectMilestones,
  getMilestoneById,
  updateMilestone,
  deleteMilestone,
  startMilestone,
  submitMilestone,
  approveMilestone,
  rejectMilestone
};