const test = require("node:test");
const assert = require("node:assert");
const axios = require("axios");

const Payment = require("../src/models/Payment.js");
const User = require("../src/models/user.js");
const Job = require("../src/models/job.js");
const Project = require("../src/models/project.js");
const Withdrawal = require("../src/models/Withdrawal.js");
const Dispute = require("../src/models/Dispute.js");
const ProjectActivity = require("../src/models/projectActivity.js");

const { planRefund, retryRefund } = require("../src/services/adminRefunds.js");
const { getAdminStats, percentChange, percentOf } = require("../src/services/adminStats.js");

/* ---------- planRefund (pure) ---------- */

test("planRefund: no refunds yet -> create the full amount", () => {
  assert.deepStrictEqual(planRefund([], 40000), { action: "CREATE", amountKobo: 40000 });
});

test("planRefund: a refund already processed -> never refund again", () => {
  const plan = planRefund([{ status: "processed", amount: 40000 }], 40000);
  assert.strictEqual(plan.action, "ALREADY_REFUNDED");
});

test("planRefund: a refund already pending/processing -> do not duplicate it", () => {
  assert.strictEqual(planRefund([{ status: "pending", amount: 40000 }], 40000).action, "ALREADY_IN_PROGRESS");
  assert.strictEqual(planRefund([{ status: "processing", amount: 40000 }], 40000).action, "ALREADY_IN_PROGRESS");
  assert.strictEqual(planRefund([{ status: "needs-attention", amount: 40000 }], 40000).action, "ALREADY_IN_PROGRESS");
});

test("planRefund: failed refunds are ignored and can be retried in full", () => {
  const plan = planRefund([{ status: "failed", amount: 40000 }], 40000);
  assert.deepStrictEqual(plan, { action: "CREATE", amountKobo: 40000 });
});

test("planRefund: a smaller earlier refund means only the remainder is requested", () => {
  const plan = planRefund([{ status: "processed", amount: 15000 }], 40000);
  assert.deepStrictEqual(plan, { action: "CREATE", amountKobo: 25000 });
});

/* ---------- retryRefund (stubbed Paystack + database) ---------- */

const withStubs = async ({ payment, refunds = [], listFails = false, createFails = false }, run) => {
  process.env.PAYSTACK_SECRET_KEY = "sk_test_x";

  const saved = { create: axios.create, findById: Payment.findById, updateOne: Payment.updateOne };
  const calls = { get: [], post: [], updates: [] };
  const errorLog = console.error;
  console.error = () => {};

  axios.create = () => ({
    get: async (url, config) => {
      calls.get.push({ url, config });
      if (listFails) throw Object.assign(new Error("network"), { response: { status: 500, data: {} } });
      return { data: { data: refunds } };
    },
    post: async (url, body) => {
      calls.post.push({ url, body });
      if (createFails) throw Object.assign(new Error("rejected"), { response: { status: 400, data: { message: "Transaction not found" } } });
      return { data: { status: true } };
    },
  });
  Payment.findById = async () => payment;
  Payment.updateOne = async (filter, update) => { calls.updates.push(update.$set); return {}; };

  try {
    return await run(calls);
  } finally {
    axios.create = saved.create;
    Payment.findById = saved.findById;
    Payment.updateOne = saved.updateOne;
    console.error = errorLog;
  }
};

const pendingPayment = (extra = {}) => ({
  _id: "pay1",
  status: "REFUND_PENDING",
  providerReference: "T123",
  metadata: { dispute: { refundAmount: 400 } },
  ...extra,
});

test("retryRefund: creates the refund in kobo when Paystack has none", async () => {
  await withStubs({ payment: pendingPayment() }, async (calls) => {
    const result = await retryRefund("pay1", "admin1");

    assert.strictEqual(result.outcome, "REQUESTED");
    assert.strictEqual(calls.post.length, 1);
    assert.strictEqual(calls.post[0].url, "/refund");
    assert.strictEqual(calls.post[0].body.transaction, "T123");
    assert.strictEqual(calls.post[0].body.amount, 40000);
    assert.strictEqual(calls.get[0].config.params.reference, "T123");
  });
});

test("retryRefund: if Paystack already refunded it, nothing is created and the payment is closed", async () => {
  await withStubs({ payment: pendingPayment(), refunds: [{ status: "processed", amount: 40000 }] }, async (calls) => {
    const result = await retryRefund("pay1", "admin1");

    assert.strictEqual(result.outcome, "ALREADY_REFUNDED");
    assert.strictEqual(calls.post.length, 0);
    assert.ok(calls.updates.some((update) => update.status === "REFUNDED"));
  });
});

test("retryRefund: if a refund is already in progress, no duplicate is created", async () => {
  await withStubs({ payment: pendingPayment(), refunds: [{ status: "pending", amount: 40000 }] }, async (calls) => {
    const result = await retryRefund("pay1", "admin1");
    assert.strictEqual(result.outcome, "ALREADY_IN_PROGRESS");
    assert.strictEqual(calls.post.length, 0);
  });
});

test("retryRefund: if the lookup fails it does nothing (fails closed)", async () => {
  await withStubs({ payment: pendingPayment(), listFails: true }, async (calls) => {
    await assert.rejects(retryRefund("pay1", "admin1"), (error) => error.statusCode === 502);
    assert.strictEqual(calls.post.length, 0);
  });
});

test("retryRefund: a Paystack rejection is reported and recorded", async () => {
  await withStubs({ payment: pendingPayment(), createFails: true }, async (calls) => {
    await assert.rejects(retryRefund("pay1", "admin1"), /Transaction not found/);
    assert.ok(calls.updates.some((update) => update["metadata.refundRetry"]?.outcome === "FAILED"));
  });
});

test("retryRefund: only REFUND_PENDING payments, only with a recorded amount", async () => {
  await withStubs({ payment: pendingPayment({ status: "RELEASED" }) }, async () => {
    await assert.rejects(retryRefund("pay1", "a"), (error) => error.statusCode === 409);
  });

  await withStubs({ payment: pendingPayment({ metadata: {} }) }, async () => {
    await assert.rejects(retryRefund("pay1", "a"), (error) => error.statusCode === 409);
  });

  await withStubs({ payment: null }, async () => {
    await assert.rejects(retryRefund("pay1", "a"), (error) => error.statusCode === 404);
  });
});

/* ---------- stats ---------- */

test("percentChange / percentOf are safe with zero", () => {
  assert.strictEqual(percentChange(15, 10), 50);
  assert.strictEqual(percentChange(5, 10), -50);
  assert.strictEqual(percentChange(5, 0), null);
  assert.strictEqual(percentOf(1, 3), 33.3);
  assert.strictEqual(percentOf(0, 0), null);
});

const chain = (result) => {
  const proxy = new Proxy({}, {
    get: (_, prop) => {
      if (prop === "then") return undefined;
      if (prop === "lean") return async () => result;
      return () => proxy;
    },
  });
  return proxy;
};

test("getAdminStats: builds the dashboard from counted data", async () => {
  const saved = [];
  const stub = (model, method, impl) => { saved.push([model, method, model[method]]); model[method] = impl; };

  let userCalls = 0;
  const userCounts = [10, 6, 4, 8, 3, 2]; // total, freelancers, clients, verified, newThis, newLast
  stub(User, "countDocuments", async () => userCounts[userCalls++]);
  stub(Job, "countDocuments", async () => 7);
  const projectCounts = { IN_PROGRESS: 5, COMPLETED: 9, CANCELLED: 1 };
  stub(Project, "countDocuments", async (filter) => projectCounts[filter.status]);
  stub(Dispute, "countDocuments", async () => 2);
  stub(Payment, "countDocuments", async () => 3);
  stub(Withdrawal, "countDocuments", async (filter) => (filter.updatedAt ? 1 : 4));
  let aggregateCalls = 0;
  stub(Payment, "aggregate", async () => (aggregateCalls++ === 0 ? [{ _id: "NGN", total: 15000 }, { _id: "USD", total: 20 }] : [{ _id: "NGN", total: 10000 }]));
  stub(Project, "find", () => chain([{ _id: "p1", title: "Shop", totalAmount: 500000, currency: "NGN", status: "IN_PROGRESS", client: { name: "Ada" }, freelancer: { name: "Tunde" } }]));
  stub(ProjectActivity, "find", () => chain([{ _id: "a1", type: "PAYMENT_RELEASED", message: "Released", project: { title: "Shop" }, createdAt: new Date() }]));

  try {
    const stats = await getAdminStats(new Date("2026-10-15T10:00:00Z"));

    assert.strictEqual(stats.users.total, 10);
    assert.strictEqual(stats.users.newThisMonth, 3);
    assert.strictEqual(stats.users.growthPercent, 50);
    assert.strictEqual(stats.jobs.open, 7);
    assert.strictEqual(stats.projects.active, 5);
    assert.strictEqual(stats.revenue.thisMonth, 15000);
    assert.strictEqual(stats.revenue.changePercent, 50);
    assert.deepStrictEqual(stats.revenue.otherCurrencies, { USD: 20 });
    assert.strictEqual(stats.attention.openDisputes, 2);
    assert.strictEqual(stats.attention.refundsPending, 3);
    assert.strictEqual(stats.attention.withdrawalsStuck, 1);
    assert.strictEqual(stats.health.verifiedUsersPercent, 80);
    assert.strictEqual(stats.health.completionRatePercent, 90);
    assert.strictEqual(stats.recentProjects[0].client, "Ada");
    assert.strictEqual(stats.recentActivity[0].projectTitle, "Shop");
  } finally {
    saved.forEach(([model, method, original]) => { model[method] = original; });
  }
});
