const projectService = require("../services/project.js");
const asyncHandler = require("../utils/asyncHandler");


/*
====================================================
GET MY PROJECTS
====================================================
*/

const getMyProjects = asyncHandler(
  async (req, res) => {
    const projects =
      await projectService.getMyProjects(
        req.user._id,
        req.user.role
      );

    res.status(200).json({
      success: true,
      data: {
        projects
      }
    });
  }
);


/*
====================================================
GET PROJECT BY ID
====================================================
*/

const getProjectById = asyncHandler(
  async (req, res) => {
    const project =
      await projectService.getProjectById(
        req.params.id,
        req.user._id,
        req.user.role
      );

    res.status(200).json({
      success: true,
      data: {
        project
      }
    });
  }
);


/*
====================================================
UPDATE PROJECT
====================================================
*/

const updateProject = asyncHandler(
  async (req, res) => {
    const project =
      await projectService.updateProject(
        req.params.id,
        req.user._id,
        req.body
      );

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: {
        project
      }
    });
  }
);


/*
====================================================
CANCEL PROJECT
====================================================
*/

const cancelProject = asyncHandler(
  async (req, res) => {
    const project =
      await projectService.cancelProject(
        req.params.id,
        req.user._id
      );

    res.status(200).json({
      success: true,
      message: "Project cancelled successfully",
      data: {
        project
      }
    });
  }
);


/*
====================================================
COMPLETE PROJECT
====================================================
*/

const completeProject = asyncHandler(
  async (req, res) => {
    const project =
      await projectService.completeProject(
        req.params.id,
        req.user._id
      );

    res.status(200).json({
      success: true,
      message: "Project completed successfully",
      data: {
        project
      }
    });
  }
);


/*
====================================================
ADMIN: GET ALL PROJECTS
====================================================
*/

const getAllProjects = asyncHandler(
  async (req, res) => {
    const projects =
      await projectService.getAllProjects();

    res.status(200).json({
      success: true,
      data: {
        projects
      }
    });
  }
);


module.exports = {
  getMyProjects,
  getProjectById,
  updateProject,
  cancelProject,
  completeProject,
  getAllProjects
};