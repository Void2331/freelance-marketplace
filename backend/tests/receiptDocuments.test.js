const test = require("node:test");
const assert = require("node:assert");

const Payment = require("../src/models/Payment.js");
const WalletTransaction = require("../src/models/WalletTransaction.js");
const User = require("../src/models/user.js");

const Milestone = require("../src/models/milestone.js");

const {
  getPaymentDocument,
  getMilestoneDocument,
  getPeriodStatement,
  renderPdf,
  buildClientReceipt,
  buildFreelancerStatement,
  buildPeriodStatement,
  pdfSafe,
  formatMoney,
} = require("../src/services/receiptDocuments.js");

const CLIENT = "aaaaaaaaaaaaaaaaaaaaaaaa";
const FREELANCER = "bbbbbbbbbbbbbbbbbbbbbbbb";
const STRANGER = "cccccccccccccccccccccccc";
const PAYMENT_ID = "65f0a1b2c3d4e5f6a7b8c9d0";

const payment = (extra = {}) => ({
  _id: PAYMENT_ID,
  amount: 150000,
  clientFee: 7500,
  freelancerFee: 15000,
  freelancerNetAmount: 135000,
  currency: "NGN",
  status: "RELEASED",
  providerReference: "PAY-123",
  paidAt: new Date("2026-09-12T10:00:00Z"),
  releasedAt: new Date("2026-09-25T14:30:00Z"),
  client: { _id: CLIENT, name: "Ada Okafor", email: "ada@example.com" },
  freelancer: { _id: FREELANCER, name: "Tunde Bello", email: "tunde@example.com" },
  project: { title: "Shop website" },
  milestone: { title: "Homepage" },
  ...extra,
});

/* ---------- helpers ---------- */

test("pdfSafe: strips accents and dots, never prints garbage", () => {
  assert.strictEqual(pdfSafe("Ọlá Ṣadé"), "Ola Sade");
  assert.strictEqual(pdfSafe("Plain ASCII 123"), "Plain ASCII 123");
  assert.strictEqual(pdfSafe("日本語"), "???");
  assert.strictEqual(pdfSafe(null), "");
});

test("formatMoney: two decimals, minus sign in front of the currency", () => {
  assert.strictEqual(formatMoney(150000, "NGN"), "NGN 150,000.00");
  assert.strictEqual(formatMoney(-15000, "NGN"), "-NGN 15,000.00");
  assert.strictEqual(formatMoney(undefined, "NGN"), "NGN 0.00");
});

/* ---------- models ---------- */

test("client receipt: total is milestone amount plus the client fee", () => {
  const model = buildClientReceipt(payment());

  assert.strictEqual(model.total, 157500);
  assert.deepStrictEqual(model.lines.map((line) => line.amount), [150000, 7500]);
  assert.match(model.number, /^RCT-20260912-B8C9D0$/);
  assert.match(model.status, /Released to the freelancer on/);
  assert.strictEqual(model.refund, 0);
});

test("client receipt: describes escrow, disputes and refunds correctly", () => {
  assert.match(buildClientReceipt(payment({ status: "FUNDED" })).status, /escrow/);
  assert.match(buildClientReceipt(payment({ status: "DISPUTED" })).status, /dispute/);

  const pending = buildClientReceipt(
    payment({ status: "REFUND_PENDING", metadata: { dispute: { refundAmount: 99000 } } })
  );
  assert.strictEqual(pending.refund, 99000);
  assert.match(pending.status, /99,000\.00 is being processed/);

  // a full refund with no recorded amount means everything paid comes back
  assert.strictEqual(buildClientReceipt(payment({ status: "REFUNDED" })).refund, 157500);
});

test("freelancer statement: full release shows gross, fee and net", () => {
  const model = buildFreelancerStatement(payment(), 135000);

  assert.deepStrictEqual(model.lines.map((line) => line.amount), [150000, -15000]);
  assert.strictEqual(model.total, 135000);
  assert.match(model.status, /in full/);
});

test("freelancer statement: a partial settlement shows only what was credited, dated by the credit", () => {
  const credited = new Date("2026-10-01T09:00:00Z");
  const model = buildFreelancerStatement(
    payment({ status: "REFUND_PENDING", releasedAt: undefined }),
    54000,
    credited
  );

  assert.strictEqual(model.total, 54000);
  assert.strictEqual(model.lines.length, 1);
  assert.match(model.status, /Partially released/);
  assert.match(model.number, /^EST-20261001-/);
  assert.ok(model.details.some(([label, value]) => label === "Released on" && value !== "-"));
});

test("period statement: totals per currency add up", () => {
  const model = buildPeriodStatement({
    freelancer: { _id: FREELANCER, name: "Tunde", email: "t@example.com" },
    from: new Date(), to: new Date(),
    entries: [
      { date: new Date(), project: "A", milestone: "1", client: "X", amount: 1000.5, currency: "NGN" },
      { date: new Date(), project: "B", milestone: "1", client: "Y", amount: 2000.25, currency: "NGN" },
      { date: new Date(), project: "C", milestone: "1", client: "Z", amount: 50, currency: "USD" },
    ],
  });

  assert.deepStrictEqual(model.totals, { NGN: 3000.75, USD: 50 });
  assert.strictEqual(model.count, 3);
});

/* ---------- PDF rendering ---------- */

const isPdf = (buffer) => Buffer.isBuffer(buffer) && buffer.subarray(0, 5).toString() === "%PDF-" && buffer.length > 1000;

test("renderPdf: produces a real PDF for every document kind", async () => {
  assert.ok(isPdf(await renderPdf(buildClientReceipt(payment()))));
  assert.ok(isPdf(await renderPdf(buildFreelancerStatement(payment(), 135000))));
  assert.ok(isPdf(await renderPdf(buildPeriodStatement({
    freelancer: { _id: FREELANCER, name: "Ọlá", email: "o@example.com" },
    from: new Date(), to: new Date(), entries: [],
  }))));
});

test("renderPdf: a long statement flows onto more than one page", async () => {
  const entries = Array.from({ length: 60 }, (_, i) => ({
    date: new Date(), project: `Project ${i}`, milestone: "M1", client: "Client", amount: 1000, currency: "NGN",
  }));

  const buffer = await renderPdf(buildPeriodStatement({
    freelancer: { _id: FREELANCER, name: "Tunde", email: "t@example.com" },
    from: new Date(), to: new Date(), entries,
  }));

  const pages = buffer.toString("latin1").match(/\/Type \/Page[^s]/g) || [];
  assert.ok(pages.length >= 2, `expected 2+ pages, found ${pages.length}`);
});

/* ---------- authorisation and loading (stubbed database) ---------- */

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

const withDb = async ({ pay, credits = [], user = { name: "Tunde", email: "t@example.com" } }, run) => {
  const saved = [Payment.findById, WalletTransaction.find, User.findById];
  const calls = { creditFilter: null };

  Payment.findById = () => chain(pay);
  WalletTransaction.find = (filter) => { calls.creditFilter = filter; return chain(credits); };
  User.findById = () => chain(user);

  try {
    return await run(calls);
  } finally {
    [Payment.findById, WalletTransaction.find, User.findById] = saved;
  }
};

test("access: the client and the freelancer each get their own document", async () => {
  await withDb({ pay: payment(), credits: [{ amount: 135000, createdAt: new Date("2026-09-25T14:30:00Z") }] }, async () => {
    const clientDoc = await getPaymentDocument(PAYMENT_ID, { _id: CLIENT, role: "CLIENT" });
    assert.strictEqual(clientDoc.kind, "CLIENT_RECEIPT");

    const freelancerDoc = await getPaymentDocument(PAYMENT_ID, { _id: FREELANCER, role: "FREELANCER" });
    assert.strictEqual(freelancerDoc.kind, "FREELANCER_STATEMENT");
    assert.strictEqual(freelancerDoc.total, 135000);
  });
});

test("access: strangers get 'not found', never the document", async () => {
  await withDb({ pay: payment() }, async () => {
    await assert.rejects(
      getPaymentDocument(PAYMENT_ID, { _id: STRANGER, role: "CLIENT" }),
      (error) => error.statusCode === 404
    );
  });

  await withDb({ pay: null }, async () => {
    await assert.rejects(getPaymentDocument(PAYMENT_ID, { _id: CLIENT }), (error) => error.statusCode === 404);
  });

  await assert.rejects(getPaymentDocument("not-an-id", { _id: CLIENT }), (error) => error.statusCode === 404);
});

test("access: an admin can pick either side", async () => {
  await withDb({ pay: payment(), credits: [{ amount: 135000, createdAt: new Date() }] }, async () => {
    const admin = { _id: STRANGER, role: "ADMIN" };

    assert.strictEqual((await getPaymentDocument(PAYMENT_ID, admin, "client")).kind, "CLIENT_RECEIPT");
    assert.strictEqual((await getPaymentDocument(PAYMENT_ID, admin, "freelancer")).kind, "FREELANCER_STATEMENT");
  });
});

test("rules: no receipt before money arrives, no statement before release", async () => {
  await withDb({ pay: payment({ status: "PENDING" }) }, async () => {
    await assert.rejects(getPaymentDocument(PAYMENT_ID, { _id: CLIENT }), (error) => error.statusCode === 409);
  });

  await withDb({ pay: payment({ status: "FUNDED" }), credits: [] }, async () => {
    await assert.rejects(getPaymentDocument(PAYMENT_ID, { _id: FREELANCER }), (error) => error.statusCode === 409);
  });
});

test("period statement: dates are Lagos days and bad input is rejected", async () => {
  await withDb({ pay: null, credits: [] }, async (calls) => {
    const model = await getPeriodStatement({ _id: FREELANCER }, "2026-01-01", "2026-01-31");

    // Lagos midnight is 23:00 UTC the day before; the end of day is 22:59:59.999 UTC
    assert.strictEqual(calls.creditFilter.createdAt.$gte.toISOString(), "2025-12-31T23:00:00.000Z");
    assert.strictEqual(calls.creditFilter.createdAt.$lte.toISOString(), "2026-01-31T22:59:59.999Z");
    assert.strictEqual(calls.creditFilter.type, "MILESTONE_EARNING");
    assert.strictEqual(calls.creditFilter.balanceType, "AVAILABLE");
    assert.strictEqual(String(calls.creditFilter.user), FREELANCER);
    assert.strictEqual(model.count, 0);

    await assert.rejects(getPeriodStatement({ _id: FREELANCER }, "01/01/2026", "2026-01-31"), (error) => error.statusCode === 400);
    await assert.rejects(getPeriodStatement({ _id: FREELANCER }, "2026-02-30x", "2026-03-01"), (error) => error.statusCode === 400);
    await assert.rejects(getPeriodStatement({ _id: FREELANCER }, "2026-03-01", "2026-01-01"), (error) => error.statusCode === 400);
  });
});

test("period statement: maps credits to rows and refuses huge periods", async () => {
  const credit = (n) => ({
    amount: 1000 + n, createdAt: new Date(2026, 0, 1 + (n % 28)),
    project: { title: "Shop" }, milestone: { title: "Homepage" },
    payment: { currency: "NGN", client: { name: "Ada" } },
  });

  await withDb({ pay: null, credits: [credit(1), credit(2)] }, async () => {
    const model = await getPeriodStatement({ _id: FREELANCER }, "2026-01-01", "2026-12-31");
    assert.strictEqual(model.rows[0].client, "Ada");
    assert.strictEqual(model.totals.NGN, 2003);
  });

  await withDb({ pay: null, credits: Array.from({ length: 501 }, (_, n) => credit(n)) }, async () => {
    await assert.rejects(getPeriodStatement({ _id: FREELANCER }, "2026-01-01", "2026-12-31"), (error) => error.statusCode === 413);
  });
});

/* ---------- by milestone (what the workroom button uses) ---------- */

const MILESTONE_ID = "65f0a1b2c3d4e5f6a7b8c9d9";

const withMilestoneDb = async ({ milestone, paid, credit, pay }, run) => {
  const saved = [Milestone.findById, Payment.findOne, Payment.findById, WalletTransaction.findOne, WalletTransaction.find];

  Milestone.findById = () => chain(milestone);
  Payment.findOne = () => chain(paid);
  Payment.findById = () => chain(pay);
  WalletTransaction.findOne = () => chain(credit);
  WalletTransaction.find = () => chain(credit ? [{ amount: 135000, createdAt: new Date("2026-09-25T14:30:00Z") }] : []);

  try {
    return await run();
  } finally {
    [Milestone.findById, Payment.findOne, Payment.findById, WalletTransaction.findOne, WalletTransaction.find] = saved;
  }
};

const milestone = { _id: MILESTONE_ID, client: CLIENT, freelancer: FREELANCER, payment: "placeholder-id-that-is-never-used" };

test("by milestone: the client's receipt comes from the payment that really received the money", async () => {
  await withMilestoneDb({ milestone, paid: { _id: PAYMENT_ID }, pay: payment() }, async () => {
    const doc = await getMilestoneDocument(MILESTONE_ID, { _id: CLIENT, role: "CLIENT" });

    assert.strictEqual(doc.kind, "CLIENT_RECEIPT");
    assert.strictEqual(doc.total, 157500);
  });
});

test("by milestone: nothing paid yet is a clear 409, not a wrong receipt", async () => {
  await withMilestoneDb({ milestone, paid: null }, async () => {
    await assert.rejects(
      getMilestoneDocument(MILESTONE_ID, { _id: CLIENT, role: "CLIENT" }),
      (error) => error.statusCode === 409
    );
  });
});

test("by milestone: the freelancer's statement comes from the wallet credit's payment", async () => {
  await withMilestoneDb({ milestone, credit: { payment: PAYMENT_ID }, pay: payment() }, async () => {
    const doc = await getMilestoneDocument(MILESTONE_ID, { _id: FREELANCER, role: "FREELANCER" });

    assert.strictEqual(doc.kind, "FREELANCER_STATEMENT");
    assert.strictEqual(doc.total, 135000);
  });

  await withMilestoneDb({ milestone, credit: null }, async () => {
    await assert.rejects(
      getMilestoneDocument(MILESTONE_ID, { _id: FREELANCER, role: "FREELANCER" }),
      (error) => error.statusCode === 409
    );
  });
});

test("by milestone: strangers, bad ids and missing milestones all get 404", async () => {
  await withMilestoneDb({ milestone, paid: { _id: PAYMENT_ID }, pay: payment() }, async () => {
    await assert.rejects(getMilestoneDocument(MILESTONE_ID, { _id: STRANGER, role: "CLIENT" }), (error) => error.statusCode === 404);
  });

  await withMilestoneDb({ milestone: null }, async () => {
    await assert.rejects(getMilestoneDocument(MILESTONE_ID, { _id: CLIENT }), (error) => error.statusCode === 404);
  });

  await assert.rejects(getMilestoneDocument("nope", { _id: CLIENT }), (error) => error.statusCode === 404);
});
