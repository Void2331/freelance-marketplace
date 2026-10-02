const Proposal = require("../models/proposal");
const Job = require("../models/job");
const Project = require("../models/project");
const AppError = require("../utils/AppError");

/*
====================================================
CREATE PROPOSAL
====================================================
*/

const createProposal = async (
  jobId,
  freelancerId,
  proposalData
) => {
  const job = await Job.findById(jobId);

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  if (job.status !== "OPEN") {
    throw new AppError(
      "You can only apply to open jobs",
      400
    );
  }

  if (
    job.client.toString() === freelancerId.toString()
  ) {
    throw new AppError(
      "You cannot submit a proposal to your own job",
      400
    );
  }

  const existingProposal = await Proposal.findOne({
    job: jobId,
    freelancer: freelancerId,
  });

  if (existingProposal) {
    throw new AppError(
      "You have already submitted a proposal for this job",
      409
    );
  }

  const proposal = await Proposal.create({
    job: jobId,
    freelancer: freelancerId,
    ...proposalData,
  });

  // Populate data required by the new-proposal email.
  await proposal.populate([
    {
      path: "job",
      populate: {
        path: "client",
        select: "name email",
      },
    },
    {
      path: "freelancer",
      select: "name",
    },
  ]);

  return proposal;
};


/*
====================================================
GET JOB PROPOSALS
====================================================
*/

const getJobProposals = async (
  jobId,
  clientId
) => {
  const job = await Job.findById(jobId);

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  if (
    job.client.toString() !==
    clientId.toString()
  ) {
    throw new AppError(
      "You can only view proposals for your own jobs",
      403
    );
  }

  const proposals = await Proposal.find({
    job: jobId,
  })
    .populate(
      "freelancer",
      "name email avatar bio skills hourlyRate"
    )
    .sort({ createdAt: -1 });

  return proposals;
};


/*
====================================================
GET MY PROPOSALS
====================================================
*/

const getMyProposals = async (
  freelancerId
) => {
  const proposals = await Proposal.find({
    freelancer: freelancerId,
  })
    .populate(
      "job",
      "title description budget budgetType deadline status"
    )
    .sort({ createdAt: -1 });

  return proposals;
};


/*
====================================================
GET CLIENT PROPOSALS
====================================================

Returns all proposals submitted to jobs owned
by the currently authenticated client.
====================================================
*/

const getClientProposals = async (
  clientId
) => {
  // Find jobs belonging to this client.
  const jobs = await Job.find({
    client: clientId,
  }).select("_id");

  const jobIds = jobs.map(
    (job) => job._id
  );

  // Find proposals submitted to those jobs.
  const proposals = await Proposal.find({
    job: {
      $in: jobIds,
    },
  })
    .populate(
      "freelancer",
      "name email avatar bio skills hourlyRate"
    )
    .populate(
      "job",
      "title description budget budgetType deadline status client"
    )
    .sort({ createdAt: -1 });

  return proposals;
};


/*
====================================================
GET PROPOSAL BY ID
====================================================
*/

const getProposalById = async (
  proposalId,
  userId
) => {
  const proposal = await Proposal.findById(
    proposalId
  )
    .populate(
      "freelancer",
      "name email avatar bio skills hourlyRate"
    )
    .populate(
      "job",
      "title description budget budgetType deadline status client"
    );

  if (!proposal) {
    throw new AppError(
      "Proposal not found",
      404
    );
  }

  const isFreelancer =
    proposal.freelancer._id.toString() ===
    userId.toString();

  const isClient =
    proposal.job.client.toString() ===
    userId.toString();

  if (!isFreelancer && !isClient) {
    throw new AppError(
      "You are not authorized to view this proposal",
      403
    );
  }

  return proposal;
};


/*
====================================================
REJECT PROPOSAL
====================================================
*/

const rejectProposal = async (
  proposalId,
  clientId
) => {
  const proposal = await Proposal.findById(
    proposalId
  ).populate("job");

  if (!proposal) {
    throw new AppError(
      "Proposal not found",
      404
    );
  }

  const job = proposal.job;

  if (
    job.client.toString() !==
    clientId.toString()
  ) {
    throw new AppError(
      "You can only reject proposals for your own jobs",
      403
    );
  }

  if (proposal.status !== "PENDING") {
    throw new AppError(
      "Only pending proposals can be rejected",
      400
    );
  }

  proposal.status = "REJECTED";

  await proposal.save();

  return proposal;
};


/*
====================================================
EXPORTS
====================================================
*/

module.exports = {
  createProposal,
  getJobProposals,
  getMyProposals,
  getClientProposals,
  getProposalById,
  rejectProposal,
};