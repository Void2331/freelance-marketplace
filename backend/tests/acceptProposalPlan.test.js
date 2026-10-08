const test = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");

const Proposal = require("../src/models/proposal");
const Project = require("../src/models/project");
const Milestone = require("../src/models/milestone");
const Job = require("../src/models/job");
const Payment = require("../src/models/Payment");
const Contract = require("../src/models/contract");
const ProjectActivity = require("../src/models/projectActivity");
const emailService = require("../src/services/email.js");

const { acceptProposal } = require("../src/controllers/proposalController.js");

const CLIENT = "aaaaaaaaaaaaaaaaaaaaaaaa";
const FREELANCER = "bbbbbbbbbbbbbbbbbbbbbbbb";

let counter = 0;
const id = () => `id${String(++counter).padStart(22, "0")}`;
const doc = (data) => ({ _id: id(), ...data, save: async () => {} });

/*
 * Drives the real acceptProposal controller with the database,
 * the transaction and the email service replaced by fakes.
 */
const run = async ({ plan, bid = 150000, body = {} }) => {
  const saved = [
    [mongoose, "startSession", mongoose.startSession],
    [Proposal, "findById", Proposal.findById],
    [Proposal, "updateMany", Proposal.updateMany],
    [Project, "findOne", Project.findOne],
    [Project, "create", Project.create],
    [Contract, "create", Contract.create],
    [Milestone, "create", Milestone.create],
    [Payment, "create", Payment.create],
    [Job, "findByIdAndUpdate", Job.findByIdAndUpdate],
    [ProjectActivity, "create", ProjectActivity.create],
    [emailService, "sendProposalAcceptedEmail", emailService.sendProposalAcceptedEmail],
  ];

  const calls = { milestoneCreates: [], payments: [], projects: [], activities: [] };

  const proposal = doc({
    status: "PENDING",
    bidAmount: bid,
    job: { _id: id(), client: CLIENT, status: "OPEN", title: "Shop website", milestonePlan: plan },
    freelancer: { _id: FREELANCER, email: "f@example.com", name: "Tunde" },
  });

  mongoose.startSession = async () => ({ withTransaction: async (fn) => { await fn(); }, endSession: async () => {} });
  Proposal.findById = () => ({ populate() { return this; }, session: async () => proposal });
  Proposal.updateMany = async () => ({});
  Project.findOne = () => ({ session: async () => null });
  Project.create = async (docs) => { calls.projects.push(...docs); return docs.map(doc2); };
  Contract.create = async (docs) => docs.map(doc2);
  Milestone.create = async (docs) => { calls.milestoneCreates.push(docs); return docs.map(doc2); };
  Payment.create = async (docs) => { calls.payments.push(...docs); return docs.map(doc2); };
  Job.findByIdAndUpdate = async () => ({});
  ProjectActivity.create = async (docs) => { calls.activities.push(...docs); return docs; };
  emailService.sendProposalAcceptedEmail = () => {};

  function doc2(data) { return doc(data); }

  const result = { status: null, body: null, error: null };
  const res = { status(code) { result.status = code; return this; }, json(payload) { result.body = payload; return this; } };

  try {
    await acceptProposal({ params: { id: proposal._id }, user: { _id: CLIENT }, body }, res, (error) => { result.error = error; });
  } finally {
    saved.forEach(([target, key, original]) => { target[key] = original; });
  }

  return { ...result, calls, proposal };
};

const PLAN = [
  { title: "Design", description: "Mockups", percentage: 30 },
  { title: "Build", description: "The app", percentage: 50 },
  { title: "Launch", description: "Deploy", percentage: 20 },
];

const allMilestones = (calls) => calls.milestoneCreates.flat();
const total = (milestones) => milestones.reduce((sum, milestone) => sum + milestone.amount, 0);

test("with a payment plan: one milestone per step, amounts add up to the bid", async () => {
  const { status, body, error, calls } = await run({ plan: PLAN });

  assert.strictEqual(error, null);
  assert.strictEqual(status, 201);

  const milestones = allMilestones(calls);

  assert.deepStrictEqual(milestones.map((m) => m.title), ["Design", "Build", "Launch"]);
  assert.deepStrictEqual(milestones.map((m) => m.amount), [45000, 75000, 30000]);
  assert.strictEqual(total(milestones), 150000);

  // the others are created unfunded, in plan order
  const rest = calls.milestoneCreates[1];
  assert.deepStrictEqual(rest.map((m) => m.status), ["PENDING", "PENDING"]);
  assert.deepStrictEqual(rest.map((m) => m.order), [2, 3]);

  assert.strictEqual(body.data.milestoneCount, 3);
  assert.strictEqual(body.data.milestoneIds.length, 3);
  assert.match(body.message, /3 milestones/);
});

test("with a payment plan: the placeholder payment matches the FIRST milestone, not the whole bid", async () => {
  const { calls } = await run({ plan: PLAN });

  assert.strictEqual(calls.payments.length, 1);
  assert.strictEqual(calls.payments[0].amount, 45000);
  assert.strictEqual(calls.payments[0].freelancerNetAmount, 45000);
});

test("without a plan: one milestone for the whole bid, exactly as before", async () => {
  for (const plan of [undefined, []]) {
    const { body, calls, error } = await run({ plan });

    assert.strictEqual(error, null);

    const milestones = allMilestones(calls);
    assert.strictEqual(milestones.length, 1);
    assert.strictEqual(milestones[0].title, "Project Milestone 1");
    assert.strictEqual(milestones[0].amount, 150000);
    assert.strictEqual(body.data.milestoneCount, 1);
    assert.strictEqual(calls.payments[0].amount, 150000);
  }
});

test("the client can opt out of the plan", async () => {
  const { calls, body } = await run({ plan: PLAN, body: { usePaymentPlan: false } });

  assert.strictEqual(allMilestones(calls).length, 1);
  assert.strictEqual(allMilestones(calls)[0].amount, 150000);
  assert.strictEqual(body.data.milestoneCount, 1);
});

test("a broken plan never blocks acceptance: it falls back to one milestone", async () => {
  const broken = [{ title: "A", percentage: 40 }, { title: "B", percentage: 50 }];
  const { status, calls, error } = await run({ plan: broken });

  assert.strictEqual(error, null);
  assert.strictEqual(status, 201);
  assert.strictEqual(allMilestones(calls).length, 1);
});

test("the plan is applied to the bid, including bids with kobo", async () => {
  const { calls } = await run({ plan: PLAN, bid: 99999.99 });

  assert.strictEqual(Math.round(total(allMilestones(calls)) * 100), 9999999);
  assert.strictEqual(allMilestones(calls).length, 3);
});

test("the existing safety checks still apply", async () => {
  const stranger = await (async () => {
    const saved = [mongoose.startSession, Proposal.findById];
    const proposal = doc({
      status: "PENDING", bidAmount: 1000,
      job: { _id: id(), client: "someoneelse", status: "OPEN", title: "x", milestonePlan: PLAN },
      freelancer: { _id: FREELANCER },
    });
    mongoose.startSession = async () => ({ withTransaction: async (fn) => { await fn(); }, endSession: async () => {} });
    Proposal.findById = () => ({ populate() { return this; }, session: async () => proposal });

    let error = null;
    try {
      await acceptProposal({ params: { id: proposal._id }, user: { _id: CLIENT }, body: {} }, {}, (e) => { error = e; });
    } finally {
      [mongoose.startSession, Proposal.findById] = saved;
    }
    return error;
  })();

  assert.strictEqual(stranger.statusCode, 403);
});
