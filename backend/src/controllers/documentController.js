const asyncHandler = require("../utils/asyncHandler");

const {
  getPaymentDocument,
  getMilestoneDocument,
  getPeriodStatement,
  renderPdf,
} = require("../services/receiptDocuments");

const sendPdf = (res, model, buffer) => {
  res.set({
    "Content-Type": "application/pdf",
    "Content-Length": buffer.length,
    "Content-Disposition": `attachment; filename="${model.number}.pdf"`,
    // Financial documents: never cache them in a shared browser.
    "Cache-Control": "no-store",
  });

  res.end(buffer);
};

/*
====================================================
GET /api/payments/receipt/:paymentId
Client -> payment receipt. Freelancer -> earnings statement
for that payment. Admin -> either (?as=client|freelancer).
====================================================
*/
const downloadReceipt = asyncHandler(async (req, res) => {
  const as = req.query.as === "freelancer" ? "freelancer" : "client";

  const model = await getPaymentDocument(req.params.paymentId, req.user, as);

  sendPdf(res, model, await renderPdf(model));
});

/*
====================================================
GET /api/payments/receipt/milestone/:milestoneId
What the workroom uses: it finds the payment that really
received the money for that milestone.
====================================================
*/
const downloadMilestoneReceipt = asyncHandler(async (req, res) => {
  const as = req.query.as === "freelancer" ? "freelancer" : "client";

  const model = await getMilestoneDocument(req.params.milestoneId, req.user, as);

  sendPdf(res, model, await renderPdf(model));
});

/*
====================================================
GET /api/payments/receipt/milestone/:milestoneId
What the workroom uses: it finds the payment that really
received the money for that milestone.
====================================================
*/

/*
====================================================
GET /api/payments/earnings-statement?from=&to=
A freelancer's earnings between two dates.
====================================================
*/
const downloadEarningsStatement = asyncHandler(async (req, res) => {
  const { from, to } = req.query;

  const model = await getPeriodStatement(
    req.user,
    typeof from === "string" ? from : undefined,
    typeof to === "string" ? to : undefined
  );

  sendPdf(res, model, await renderPdf(model));
});

module.exports = {
  downloadReceipt,
  downloadMilestoneReceipt,
  downloadEarningsStatement,
};
