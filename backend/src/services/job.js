const AppError = require("../utils/AppError");
const Job = require("../models/job");
const Project = require("../models/project");

/*
====================================================
CREATE JOB
====================================================
*/
const createJob = async (clientId, jobData) => {
  const job = await Job.create({
    ...jobData,
    client: clientId,
  });

  return job;
};

/*
====================================================
BROWSE OPEN JOBS
Supports optional category / skill filters
====================================================
*/
const getJobs = async (query,filters = {}) => {
  let { limit , page } = query

  if(!limit) {
    limit = 10
  }

  if(!page) {
    page = 1
  }

  const skip = (page - 1) * limit;

  const filter = { status: "OPEN" };

  if (filters.category) {
    filter.category = filters.category;
  }

  if (filters.skill) {
    filter.skills = filters.skill;
  }

  const returnData = await Job.aggregate([
  // 1. Filter your documents first
  { $match: filter },

  // 2. Split the pipeline into parallel tracks
  {
    $facet: {
      totalCount: [
        { $count: 'count' }
      ],
      pageData: [
        { $sort: { createdAt: -1 } }, 
        { $skip: JSON.parse(skip) },              
        { $limit: JSON.parse(limit) },
        
         {
          $lookup: {
            from: 'users',      
            localField: 'client',   
            foreignField: '_id',
            as: 'client',
            pipeline: [{ $project: { name: 1, email: 1, avatar: 1 } }]      
          }
          },
          
           {
          $unwind: {
            path: '$User',
            preserveNullAndEmptyArrays: true
          }
        },
      ]
    }
  },

  {
    $project: {
      data: '$pageData',
      totalDocuments: { $ifNull: [{ $arrayElemAt: ['$totalCount.count', 0] }, 0] },
      totalPages: {
        $ceil: {
          $divide: [
            { $ifNull: [{ $arrayElemAt: ['$totalCount.count', 0] }, 0] },
            JSON.parse(limit)
          ]
        }
      },
      'client.name': 1,
      'client.avatar': 1,
      'client.location': 1,
      'client._id': 1
    }
  }
]);

  const jobs = {
    data: returnData[0].data,
    totalDocuments: returnData[0].totalDocuments,
    totalPages: returnData[0].totalPages,
    currentPage: page,
  };

  const {data, totalDocuments, totalPages, currentPage} = jobs;

  return {data, totalDocuments, totalPages, currentPage};
};

/*
====================================================
GET A CLIENT'S OWN POSTED JOBS
====================================================
*/
/*
====================================================
ADMIN: LIST EVERY JOB, ANY STATUS
====================================================
*/
const getAllJobsAdmin = async () => {
  const jobs = await Job.find({})
    .populate("client", "name email avatar")
    .sort({ createdAt: -1 });

  return jobs;
};

const getMyJobs = async (clientId) => {
  const jobs = await Job.find({ client: clientId }).sort({
    createdAt: -1,
  });

  return jobs;
};

/*
====================================================
GET JOB BY ID
====================================================
*/
const getJobById = async (jobId) => {
  const job = await Job.findById(jobId).populate(
    "client",
    "name avatar location bio"
  );

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  return job;
};

/*
====================================================
UPDATE JOB
Owner only, only while still OPEN
====================================================
*/
const updateJob = async (jobId, clientId, updates) => {
  const job = await Job.findById(jobId);

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  if (job.client.toString() !== clientId.toString()) {
    throw new AppError(
      "Only the job owner can update this job",
      403
    );
  }

  if (job.status !== "OPEN") {
    throw new AppError(
      "Only open jobs can be edited",
      400
    );
  }

  Object.assign(job, updates);
  await job.save();

  return job;
};

/*
====================================================
DELETE JOB
Owner only, only while still OPEN
(jobs that already moved to IN_PROGRESS have an
 accepted proposal/project behind them and must not
 be deleted)
====================================================
*/
const deleteJob = async (jobId, clientId) => {
  const job = await Job.findById(jobId);

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  if (job.client.toString() !== clientId.toString()) {
    throw new AppError(
      "Only the job owner can delete this job",
      403
    );
  }

  if (job.status !== "OPEN") {
    throw new AppError(
      "Only open jobs can be deleted",
      400
    );
  }

  await job.deleteOne();
};

/*
====================================================
ADMIN: REMOVE A JOB (any owner, moderation)
If a project was ever created from this job, the job is
closed (CANCELLED) rather than deleted, so the project's
reference stays intact. Otherwise it's deleted outright.
====================================================
*/
const adminRemoveJob = async (jobId) => {
  const job = await Job.findById(jobId);

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  const hasProject = await Project.exists({ job: jobId });

  if (hasProject) {
    job.status = "CANCELLED";
    await job.save();

    return { job, deleted: false };
  }

  await job.deleteOne();

  return { job, deleted: true };
};

module.exports = {
  createJob,
  adminRemoveJob,
   getAllJobsAdmin,
  getJobs,
  getMyJobs,
  getJobById,
  updateJob,
  deleteJob,
};
