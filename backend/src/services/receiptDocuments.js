const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");

const Payment = require("../models/Payment.js");
const Milestone = require("../models/milestone.js");
const WalletTransaction = require("../models/WalletTransaction.js");
const User = require("../models/user.js");

const AppError = require("../utils/AppError");

/*
====================================================
RECEIPTS AND EARNINGS STATEMENTS (PDF)

  Client receipt           proof of a payment they made
  Freelancer statement     proof of what one payment earned
  Period earnings          everything a freelancer earned
                           between two dates (proof of income)

Each document is built in two steps so the numbers can be
tested without a PDF:  data -> model (pure)  ->  PDF.

Money shown for freelancers comes from WALLET CREDITS, the
same records that moved the money, never from a recalculation.

These are payment records, not tax invoices.
====================================================
*/

const PLATFORM_NAME = () => process.env.PLATFORM_NAME || "FreelanceHub";

// Money has been received for these, so the client can have a receipt.
const PAID_STATUSES = [
  "FUNDED",
  "RELEASED",
  "REFUND_PENDING",
  "REFUNDED",
  "DISPUTED",
];

const MAX_STATEMENT_ROWS = 500;

const round2 = (value) => Math.round(value * 100) / 100;

/* ---------- formatting helpers ---------- */

const TIME_ZONE = "Africa/Lagos";

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-NG", {
        timeZone: TIME_ZONE,
        dateStyle: "medium",
      }).format(new Date(value))
    : "-";

const formatMoney = (amount, currency = "NGN") => {
  const value = Number(amount || 0);

  const text = Math.abs(value).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // "-NGN 15,000.00" reads better than "NGN -15,000.00".
  return `${value < 0 ? "-" : ""}${currency} ${text}`;
};

/*
 * PDFKit's built-in fonts only cover Western European text, so
 * "Ọlá" would print garbled. Strip accents/dots and replace
 * anything else unsupported, instead of printing nonsense.
 */
const pdfSafe = (value) =>
  String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "?");

const dateStamp = (value) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));

  return parts.replaceAll("-", "");
};

const documentNumber = (prefix, id, date) =>
  `${prefix}-${dateStamp(date)}-${String(id).slice(-6).toUpperCase()}`;

/* ---------- MODELS (pure) ---------- */

const sum = (items, pick) =>
  round2(items.reduce((total, item) => total + Number(pick(item) || 0), 0));

/*
 * What the client paid and what became of it.
 */
const buildClientReceipt = (payment) => {
  const amount = Number(payment.amount) || 0;
  const clientFee = Number(payment.clientFee) || 0;
  const total = round2(amount + clientFee);

  const refund =
    Number(payment.metadata?.dispute?.refundAmount) ||
    (payment.status === "REFUNDED" ? total : 0);

  let status;

  switch (payment.status) {
    case "RELEASED":
      status = `Released to the freelancer on ${formatDate(payment.releasedAt)}.`;
      break;
    case "REFUND_PENDING":
      status = `A refund of ${formatMoney(refund, payment.currency)} is being processed.`;
      break;
    case "REFUNDED":
      status = `Refunded${payment.refundedAt ? ` on ${formatDate(payment.refundedAt)}` : ""}.`;
      break;
    case "DISPUTED":
      status = "Under dispute. Funds stay held until the dispute is resolved.";
      break;
    default:
      status = "Held securely in escrow until you approve the milestone.";
  }

  return {
    kind: "CLIENT_RECEIPT",
    title: "Payment Receipt",
    number: documentNumber("RCT", payment._id, payment.paidAt || payment.createdAt),
    issuedOn: new Date(),
    currency: payment.currency,
    parties: [
      { label: "Paid by", name: payment.client?.name, email: payment.client?.email },
      { label: "For work by", name: payment.freelancer?.name, email: payment.freelancer?.email },
    ],
    details: [
      ["Project", payment.project?.title || "-"],
      ["Milestone", payment.milestone?.title || "-"],
      ["Payment date", formatDate(payment.paidAt || payment.createdAt)],
      ["Payment method", "Card / bank via Paystack"],
      ["Reference", payment.providerReference || "-"],
    ],
    lines: [
      { label: "Milestone amount", amount },
      { label: "Platform service fee", amount: clientFee },
    ],
    totalLabel: "Total paid",
    total,
    refund: refund > 0 ? round2(refund) : 0,
    status,
  };
};

/*
 * What one payment earned the freelancer. `credited` is the sum of
 * the wallet credits for that payment.
 */
const buildFreelancerStatement = (payment, credited, releasedAt) => {
  // Partial dispute settlements never set payment.releasedAt, so the
  // caller passes the date of the wallet credit instead.
  const releaseDate = releasedAt || payment.releasedAt;

  const amount = Number(payment.amount) || 0;
  const fee = Number(payment.freelancerFee) || 0;
  const net = round2(
    Number(payment.freelancerNetAmount) || round2(amount - fee)
  );

  const credit = round2(credited);
  const isFull = Math.abs(credit - net) < 0.01;

  const lines = isFull
    ? [
        { label: "Milestone amount", amount },
        { label: "Platform fee deducted", amount: -fee },
      ]
    : [{ label: "Amount released after dispute settlement", amount: credit }];

  return {
    kind: "FREELANCER_STATEMENT",
    title: "Earnings Statement",
    number: documentNumber("EST", payment._id, releaseDate || payment.createdAt),
    issuedOn: new Date(),
    currency: payment.currency,
    parties: [
      { label: "Earned by", name: payment.freelancer?.name, email: payment.freelancer?.email },
      { label: "Paid for by", name: payment.client?.name },
    ],
    details: [
      ["Project", payment.project?.title || "-"],
      ["Milestone", payment.milestone?.title || "-"],
      ["Released on", formatDate(releaseDate)],
    ],
    lines,
    totalLabel: "Credited to your wallet",
    total: credit,
    refund: 0,
    status: isFull
      ? "Released in full and credited to your wallet."
      : "Partially released after a dispute settlement. The rest was refunded to the client.",
  };
};

/*
 * Everything a freelancer earned in a period.
 * entries: { date, project, milestone, client, amount, currency }
 */
const buildPeriodStatement = ({ freelancer, from, to, entries }) => {
  const totals = {};

  entries.forEach((entry) => {
    totals[entry.currency] = round2((totals[entry.currency] || 0) + entry.amount);
  });

  return {
    kind: "PERIOD_STATEMENT",
    title: "Earnings Statement",
    number: documentNumber("EST", freelancer._id, new Date()),
    issuedOn: new Date(),
    freelancer: { name: freelancer.name, email: freelancer.email },
    period: { from, to },
    rows: entries,
    totals,
    count: entries.length,
  };
};

/* ---------- PDF RENDERING ---------- */

const COLORS = { ink: "#111827", muted: "#6b7280", line: "#e5e7eb" };

const start = (title) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
    info: { Title: pdfSafe(title), Producer: PLATFORM_NAME() },
  });

  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  const finished = new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  return { doc, finished };
};

const header = (doc, model) => {
  doc.fillColor(COLORS.ink).font("Helvetica-Bold").fontSize(20).text(pdfSafe(PLATFORM_NAME()));

  doc.moveDown(0.2).font("Helvetica").fontSize(11).fillColor(COLORS.muted).text(pdfSafe(model.title));

  doc.fontSize(9)
    .text(`No. ${model.number}`, 350, 50, { width: 195, align: "right" })
    .text(`Issued ${formatDate(model.issuedOn)}`, 350, 63, { width: 195, align: "right" });

  doc.moveTo(50, 95).lineTo(545, 95).strokeColor(COLORS.line).stroke();
  doc.y = 110;
  doc.x = 50;
};

const footer = (doc, text) => {
  doc.fontSize(8).fillColor(COLORS.muted).text(pdfSafe(text), 50, 760, { width: 495, align: "center" });
};

const NOT_INVOICE =
  "This document is a payment record issued by the platform. It is not a tax invoice. Keep it for your records.";

const renderSingle = async (model) => {
  const { doc, finished } = start(model.title);

  header(doc, model);

  const top = doc.y;

  model.parties.forEach((party, index) => {
    const x = 50 + index * 250;

    doc.fontSize(8).fillColor(COLORS.muted).font("Helvetica").text(party.label.toUpperCase(), x, top);
    doc.fontSize(11).fillColor(COLORS.ink).font("Helvetica-Bold").text(pdfSafe(party.name || "-"), x, top + 12, { width: 230 });

    if (party.email) {
      doc.fontSize(9).fillColor(COLORS.muted).font("Helvetica").text(pdfSafe(party.email), x, doc.y, { width: 230 });
    }
  });

  doc.y = top + 62;
  doc.x = 50;

  model.details.forEach(([label, value]) => {
    const y = doc.y;
    doc.fontSize(9).fillColor(COLORS.muted).font("Helvetica").text(label, 50, y, { width: 130 });
    doc.fontSize(10).fillColor(COLORS.ink).text(pdfSafe(value), 185, y, { width: 360 });
    doc.moveDown(0.5);
  });

  doc.moveDown(1);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor(COLORS.line).stroke();
  doc.moveDown(0.8);

  model.lines.forEach((line) => {
    const y = doc.y;
    doc.fontSize(10).fillColor(COLORS.ink).font("Helvetica").text(line.label, 50, y, { width: 330 });
    doc.text(formatMoney(line.amount, model.currency), 380, y, { width: 165, align: "right" });
    doc.moveDown(0.6);
  });

  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor(COLORS.line).stroke();
  doc.moveDown(0.6);

  const totalY = doc.y;
  doc.fontSize(12).font("Helvetica-Bold").fillColor(COLORS.ink).text(model.totalLabel, 50, totalY, { width: 250 });
  doc.text(formatMoney(model.total, model.currency), 300, totalY, { width: 245, align: "right" });
  doc.moveDown(1.2);

  if (model.refund > 0) {
    const y = doc.y;
    doc.fontSize(10).font("Helvetica").fillColor(COLORS.ink).text("Refunded to client", 50, y, { width: 330 });
    doc.text(formatMoney(model.refund, model.currency), 380, y, { width: 165, align: "right" });
    doc.moveDown(0.8);
  }

  doc.fontSize(10).font("Helvetica-Oblique").fillColor(COLORS.muted).text(pdfSafe(model.status), 50, doc.y, { width: 495 });

  footer(doc, NOT_INVOICE);
  doc.end();

  return finished;
};

const renderPeriod = async (model) => {
  const { doc, finished } = start(model.title);

  header(doc, model);

  doc.fontSize(8).fillColor(COLORS.muted).font("Helvetica").text("EARNED BY", 50, doc.y);
  doc.fontSize(11).fillColor(COLORS.ink).font("Helvetica-Bold").text(pdfSafe(model.freelancer.name || "-"));
  doc.fontSize(9).fillColor(COLORS.muted).font("Helvetica").text(pdfSafe(model.freelancer.email || ""));

  doc.moveDown(0.8);
  doc.fontSize(10).fillColor(COLORS.ink).text(
    `Period: ${formatDate(model.period.from)} to ${formatDate(model.period.to)}`
  );

  doc.moveDown(1);

  const columns = [
    { label: "Date", x: 50, width: 70 },
    { label: "Project / milestone", x: 125, width: 210 },
    { label: "Client", x: 340, width: 100 },
    { label: "Amount", x: 445, width: 100, align: "right" },
  ];

  const drawHead = () => {
    const y = doc.y;
    columns.forEach((column) => {
      doc.fontSize(8).font("Helvetica-Bold").fillColor(COLORS.muted).text(column.label.toUpperCase(), column.x, y, { width: column.width, align: column.align });
    });
    doc.moveTo(50, y + 14).lineTo(545, y + 14).strokeColor(COLORS.line).stroke();
    doc.y = y + 20;
  };

  drawHead();

  if (model.rows.length === 0) {
    doc.fontSize(10).font("Helvetica").fillColor(COLORS.muted).text("No earnings were released in this period.", 50, doc.y);
  }

  model.rows.forEach((row) => {
    if (doc.y > 700) {
      doc.addPage();
      doc.y = 50;
      drawHead();
    }

    const y = doc.y;

    doc.fontSize(9).font("Helvetica").fillColor(COLORS.ink);
    doc.text(formatDate(row.date), 50, y, { width: 70 });
    doc.text(pdfSafe(`${row.project} - ${row.milestone}`), 125, y, { width: 210 });
    doc.text(pdfSafe(row.client), 340, y, { width: 100 });
    doc.text(formatMoney(row.amount, row.currency), 445, y, { width: 100, align: "right" });

    doc.y = Math.max(doc.y, y + 14) + 6;
  });

  doc.moveDown(0.5);

  if (doc.y > 690) doc.addPage();

  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor(COLORS.line).stroke();
  doc.moveDown(0.6);

  Object.entries(model.totals).forEach(([currency, total]) => {
    const y = doc.y;
    doc.fontSize(12).font("Helvetica-Bold").fillColor(COLORS.ink).text(`Total earned (${model.count} payment${model.count === 1 ? "" : "s"})`, 50, y, { width: 280 });
    doc.text(formatMoney(total, currency), 330, y, { width: 215, align: "right" });
    doc.moveDown(0.6);
  });

  footer(doc, `${NOT_INVOICE} Amounts are what was credited to your wallet after platform fees.`);
  doc.end();

  return finished;
};

const renderPdf = (model) =>
  model.kind === "PERIOD_STATEMENT" ? renderPeriod(model) : renderSingle(model);

/* ---------- DATABASE LOADERS ---------- */

const assertObjectId = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Payment not found", 404);
  }
};

const sameId = (a, b) => String(a?._id ?? a) === String(b?._id ?? b);

/*
 * Builds the receipt (client) or statement (freelancer) for ONE
 * payment. Clients and freelancers only ever see their own payments;
 * an admin picks a side with `as`.
 */
const getPaymentDocument = async (paymentId, user, as = "client") => {
  assertObjectId(paymentId);

  const payment = await Payment.findById(paymentId)
    .populate("client", "name email")
    .populate("freelancer", "name email")
    .populate("project", "title")
    .populate("milestone", "title")
    .lean();

  if (!payment) throw new AppError("Payment not found", 404);

  const isClient = sameId(payment.client, user._id);
  const isFreelancer = sameId(payment.freelancer, user._id);
  const isAdmin = user.role === "ADMIN";

  if (!isClient && !isFreelancer && !isAdmin) {
    // Same answer as "does not exist", so ids cannot be probed.
    throw new AppError("Payment not found", 404);
  }

  const side = isClient ? "client" : isFreelancer ? "freelancer" : as;

  if (side === "client") {
    if (!PAID_STATUSES.includes(payment.status)) {
      throw new AppError("No payment has been received for this milestone yet.", 409);
    }

    return buildClientReceipt(payment);
  }

  const credits = await WalletTransaction.find({
    payment: payment._id,
    type: "MILESTONE_EARNING",
    balanceType: "AVAILABLE",
    direction: "CREDIT",
  })
    .select("amount createdAt")
    .lean();

  const credited = sum(credits, (credit) => credit.amount);

  const lastCreditAt = credits.reduce(
    (latest, credit) =>
      !latest || new Date(credit.createdAt) > latest
        ? new Date(credit.createdAt)
        : latest,
    null
  );

  if (credited <= 0) {
    throw new AppError(
      "Earnings statements are available once the payment has been released.",
      409
    );
  }

  return buildFreelancerStatement(payment, credited, lastCreditAt);
};

/*
 * Receipt / statement for a MILESTONE.
 *
 * milestone.payment is only a placeholder made when a proposal is
 * accepted; the payment that actually received the money is created
 * later, when the client pays. So the real payment is looked up from
 * the milestone, never taken from that link.
 */
const getMilestoneDocument = async (milestoneId, user, as = "client") => {
  assertObjectId(milestoneId);

  const milestone = await Milestone.findById(milestoneId)
    .select("client freelancer")
    .lean();

  if (!milestone) throw new AppError("Milestone not found", 404);

  const isClient = sameId(milestone.client, user._id);
  const isFreelancer = sameId(milestone.freelancer, user._id);
  const isAdmin = user.role === "ADMIN";

  if (!isClient && !isFreelancer && !isAdmin) {
    throw new AppError("Milestone not found", 404);
  }

  const side = isClient ? "client" : isFreelancer ? "freelancer" : as;

  let paymentId;

  if (side === "client") {
    const paid = await Payment.findOne({
      milestone: milestone._id,
      status: { $in: PAID_STATUSES },
    })
      .sort({ createdAt: -1 })
      .select("_id")
      .lean();

    if (!paid) {
      throw new AppError("No payment has been received for this milestone yet.", 409);
    }

    paymentId = paid._id;
  } else {
    const credit = await WalletTransaction.findOne({
      milestone: milestone._id,
      type: "MILESTONE_EARNING",
      balanceType: "AVAILABLE",
      direction: "CREDIT",
    })
      .sort({ createdAt: -1 })
      .select("payment")
      .lean();

    if (!credit?.payment) {
      throw new AppError(
        "Earnings statements are available once the payment has been released.",
        409
      );
    }

    paymentId = credit.payment;
  }

  // Same document builder (and the same access check) as by payment id.
  return getPaymentDocument(String(paymentId), user, as);
};

// "2026-01-31" at Lagos midnight (UTC+1, no daylight saving).
const lagosDay = (value, endOfDay) =>
  new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}+01:00`);

const isDateString = (value) =>
  typeof value === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(lagosDay(value, false).getTime());

/*
 * Everything a freelancer earned between two dates, taken from the
 * wallet credits that actually moved the money.
 */
const getPeriodStatement = async (user, fromInput, toInput) => {
  const now = new Date();
  const year = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric" }).format(now);
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(now);

  const fromText = fromInput || `${year}-01-01`;
  const toText = toInput || today;

  if (!isDateString(fromText) || !isDateString(toText)) {
    throw new AppError("Dates must look like 2026-01-31.", 400);
  }

  const from = lagosDay(fromText, false);
  const to = lagosDay(toText, true);

  if (from > to) {
    throw new AppError("The start date must be before the end date.", 400);
  }

  const freelancer = await User.findById(user._id).select("name email").lean();

  const credits = await WalletTransaction.find({
    user: user._id,
    type: "MILESTONE_EARNING",
    balanceType: "AVAILABLE",
    direction: "CREDIT",
    createdAt: { $gte: from, $lte: to },
  })
    .sort({ createdAt: 1 })
    .limit(MAX_STATEMENT_ROWS + 1)
    .populate("project", "title")
    .populate("milestone", "title")
    .populate({
      path: "payment",
      select: "client currency",
      populate: { path: "client", select: "name" },
    })
    .lean();

  if (credits.length > MAX_STATEMENT_ROWS) {
    throw new AppError(
      `That period has more than ${MAX_STATEMENT_ROWS} payments. Please choose a shorter one.`,
      413
    );
  }

  const entries = credits.map((credit) => ({
    date: credit.createdAt,
    project: credit.project?.title || "-",
    milestone: credit.milestone?.title || "-",
    client: credit.payment?.client?.name || "-",
    amount: credit.amount,
    currency: credit.payment?.currency || "NGN",
  }));

  return buildPeriodStatement({ freelancer, from, to, entries });
};

module.exports = {
  getPaymentDocument,
  getMilestoneDocument,
  getPeriodStatement,
  renderPdf,
  buildClientReceipt,
  buildFreelancerStatement,
  buildPeriodStatement,
  pdfSafe,
  formatMoney,
};
