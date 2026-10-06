const asyncHandler = require("../utils/asyncHandler");
const jobService = require("../services/job.js");

/*
====================================================
CREATE JOB
CLIENT ONLY
====================================================
*/
const createJob = asyncHandler(async (req, res) => {
  const job = await jobService.createJob(
    req.user._id,
    req.body
  );

  res.status(201).json({
    success: true,
    message: "Job posted successfully",
    data: { job },
  });
});

/*
====================================================
BROWSE OPEN JOBS (public - the landing page fetches it
without a token). Supports optional ?page= ?limit=
?category= ?skill= (schema-validated in jobRoutes.js)
====================================================
*/
const getJobs = asyncHandler(async (req, res) => {
  const jobs = await jobService.getJobs(req.query,{
    category: req.query.category,
    skill: req.query.skill,
  });

  res.status(200).json({
    success: true,
    ...jobs,
  });
});

/*
====================================================
GET MY POSTED JOBS
CLIENT ONLY
====================================================
*/
const getAllJobsAdmin = asyncHandler(async (req, res) => {
  const jobs = await jobService.getAllJobsAdmin();

  res.status(200).json({
    success: true,
    data: { jobs },
  });
});

const getMyJobs = asyncHandler(async (req, res) => {
  const jobs = await jobService.getMyJobs(req.user._id);

  res.status(200).json({
    success: true,
    data: { jobs },
  });
});

/*
====================================================
GET JOB BY ID
====================================================
*/
const getJobById = asyncHandler(async (req, res) => {
  const job = await jobService.getJobById(req.params.id);

  res.status(200).json({
    success: true,
    data: { job },
  });
});

/*
====================================================
UPDATE JOB
CLIENT (owner) ONLY - only while still OPEN
====================================================
*/
const updateJob = asyncHandler(async (req, res) => {
  const job = await jobService.updateJob(
    req.params.id,
    req.user._id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Job updated successfully",
    data: { job },
  });
});

/*
====================================================
CANCEL / DELETE JOB
CLIENT (owner) ONLY - only while still OPEN
====================================================
*/
const deleteJob = asyncHandler(async (req, res) => {
  await jobService.deleteJob(req.params.id, req.user._id);

  res.status(200).json({
    success: true,
    message: "Job deleted successfully",
  });
});

/*
====================================================
ADMIN: REMOVE A JOB
Bypasses the owner check deleteJob enforces.
====================================================
*/
const adminDeleteJob = asyncHandler(async (req, res) => {
  const { job, deleted } = await jobService.adminRemoveJob(
    req.params.id
  );

  res.status(200).json({
    success: true,
    message: deleted
      ? "Job deleted"
      : "Job has an associated project, so it was closed instead of deleted",
    data: { job, deleted },
  });
});

module.exports = {
  adminDeleteJob,
  getAllJobsAdmin,
  createJob,
  getJobs,
  getMyJobs,
  getJobById,
  updateJob,
  deleteJob,
};
