const axios = require("axios");
const crypto = require("crypto");

const Milestone = require("../models/milestone.js");
const User = require("../models/user.js");
const AppError = require("../utils/AppError");
const Payment = require("../models/Payment.js");
const ProjectActivity = require("../models/projectActivity.js");

const paystack = axios.create({
  baseURL:
    process.env.PAYSTACK_BASE_URL ||
    "https://api.paystack.co",

  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json"
  }
});

/*
|--------------------------------------------------------------------------
| Calculate Platform Fees
|--------------------------------------------------------------------------
*/

const calculateFees = (amount) => {
  const clientFeePercent =
    Number(process.env.PLATFORM_CLIENT_FEE_PERCENT) || 5;

  const freelancerFeePercent =
    Number(
      process.env.PLATFORM_FREELANCER_FEE_PERCENT
    ) || 5;

  const clientFee =
    amount * (clientFeePercent / 100);

  const freelancerFee =
    amount * (freelancerFeePercent / 100);

  const freelancerNetAmount =
    amount - freelancerFee;

  return {
    clientFee,
    freelancerFee,
    freelancerNetAmount
  };
};

/*
|--------------------------------------------------------------------------
| Initialize Milestone Payment
|--------------------------------------------------------------------------
*/

const initializeMilestonePayment = async ({
  milestoneId,
  clientId
}) => {
  const milestone = await Milestone.findById(
    milestoneId
  ).populate("project");

  if (!milestone) {
    throw new AppError(
      "Milestone not found",
      404
    );
  }

  if (
    milestone.client.toString() !==
    clientId.toString()
  ) {
    throw new AppError(
      "You are not authorized to fund this milestone",
      403
    );
  }

  if (
    !["PENDING", "REVISION_REQUESTED"].includes(
      milestone.status
    )
  ) {
    throw new AppError(
      "This milestone cannot be funded",
      400
    );
  }

  const existingPayment = await Payment.findOne({
  milestone: milestone._id,
  status: { $in: ["PROCESSING", "FUNDED"] },
});

if (existingPayment) {
  if (existingPayment.status === "FUNDED") {
    throw new AppError("This milestone has already been funded", 400);
  }

  // PROCESSING: check with Paystack before blocking
  let txStatus = null;

  try {
    const { data } = await paystack.get(
      `/transaction/verify/${existingPayment.providerReference}`
    );
    txStatus = data.data.status;
  } catch (err) {
    // 404 means Paystack never saw this reference, so it's safe to retire
    if (err.response?.status !== 404) {
      throw new AppError(
        "Unable to confirm the status of the existing payment. Try again shortly.",
        502
      );
    }
  }

  if (["success", "ongoing", "pending", "processing", "queued"].includes(txStatus)) {
    throw new AppError(
      "A payment for this milestone is already in progress or being confirmed",
      409
    );
  }

  // abandoned / failed / reversed / never initialized: retire it
  existingPayment.status = "CANCELLED";
  await existingPayment.save();
}

  const client = await User.findById(clientId);

  if (!client) {
    throw new AppError(
      "Client not found",
      404
    );
  }

  const fees = calculateFees(
    milestone.amount
  );

  const totalClientCharge =
    milestone.amount + fees.clientFee;

  const reference =
    `FM-${milestone._id}-${crypto
      .randomBytes(6)
      .toString("hex")}`;

  /*
  |--------------------------------------------------------------------------
  | Create Payment Record
  |--------------------------------------------------------------------------
  */

  const payment = await Payment.create({
    project: milestone.project._id,
    milestone: milestone._id,
    client: milestone.client,
    freelancer: milestone.freelancer,
    amount: milestone.amount,
    clientFee: fees.clientFee,
    freelancerFee: fees.freelancerFee,
    freelancerNetAmount:
      fees.freelancerNetAmount,
    currency: milestone.currency,
    status: "PROCESSING",
    provider: "PAYSTACK",
    providerReference: reference
  });

  /*
  |--------------------------------------------------------------------------
  | Create Project Activity
  |--------------------------------------------------------------------------
  */

  await ProjectActivity.create({
    project: milestone.project._id,

    user: clientId,

    type: "PAYMENT_INITIALIZED",

    milestone: milestone._id,

    message:
      "Payment has been initialized and is awaiting client payment.",

    metadata: {
      paymentId: payment._id,
      paymentReference:
        payment.providerReference,
      amount:
        payment.amount,
      currency:
        payment.currency
    }
  });

  /*
  |--------------------------------------------------------------------------
  | Initialize Transaction With Paystack
  |--------------------------------------------------------------------------
  */

  try {
    const response = await paystack.post(
      "/transaction/initialize",
      {
        email: client.email,

        amount: Math.round(
          totalClientCharge * 100
        ),

        currency: milestone.currency,

        reference,

        callback_url: `${process.env.CLIENT_URL}/payment/callback`,

        metadata: {
          paymentId:
            payment._id.toString(),

          milestoneId:
            milestone._id.toString(),

          projectId:
            milestone.project._id.toString(),

          clientId:
            clientId.toString()
        }
      }
    );

    return {
      paymentId: payment._id,

      reference,

      authorizationUrl:
        response.data.data.authorization_url,

      accessCode:
        response.data.data.access_code,

      amount:
        milestone.amount,

      clientFee:
        fees.clientFee,

      totalClientCharge
    };
  } catch (error) {
    /*
    |--------------------------------------------------------------------------
    | Paystack Initialization Failed
    |--------------------------------------------------------------------------
    */

    payment.status = "FAILED";

    await payment.save();

    console.error(
      "Paystack initialization error:",
      error.response?.data ||
        error.message
    );

    throw new AppError(
      "Unable to initialize payment",
      500
    );
  }
};

/*
|--------------------------------------------------------------------------
| Verify Payment
|--------------------------------------------------------------------------
|
| IMPORTANT:
| This function ONLY verifies the transaction with Paystack.
|
| It does NOT:
| - change payment status to FUNDED
| - fund the milestone
| - activate the contract
|
| The Paystack webhook is responsible for settlement.
|--------------------------------------------------------------------------
*/

const verifyPayment = async ({ reference, userId }) => {
  if (!reference || typeof reference !== "string") {
    throw new AppError("Payment reference is required", 400);
  }

  const payment = await Payment.findOne({ providerReference: reference });

  if (!payment) {
    throw new AppError("Payment record not found", 404);
  }

  // Only the client who made the payment can verify it
  if (payment.client.toString() !== userId.toString()) {
    throw new AppError("You are not authorized to verify this payment", 403);
  }

  let transaction;

  try {
    const response = await paystack.get(
      `/transaction/verify/${encodeURIComponent(reference)}`
    );
    transaction = response.data.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new AppError("Transaction not found on Paystack", 404);
    }

    console.error(
      "Paystack verify error:",
      error.response?.data || error.message
    );

    throw new AppError("Unable to verify payment right now. Try again shortly.", 502);
  }

  // Sanity checks that the response is for THIS payment
  if (transaction.reference !== payment.providerReference) {
    throw new AppError("Payment reference mismatch", 400);
  }

  // Amount and currency only matter once Paystack says it was paid
  if (transaction.status === "success") {
    const expectedAmount = Math.round(
      (payment.amount + payment.clientFee) * 100
    );

    if (Number(transaction.amount) !== expectedAmount) {
      throw new AppError("Payment amount mismatch", 400);
    }

    if (
      transaction.currency &&
      transaction.currency.toUpperCase() !== payment.currency
    ) {
      throw new AppError("Payment currency mismatch", 400);
    }
  }

  // Harmless bookkeeping; does NOT change payment.status or fund anything
  payment.providerStatus = transaction.status;
  payment.providerTransactionId = String(transaction.id);
  await payment.save();

  return {
    paymentId: payment._id,
    reference: payment.providerReference,
    paymentStatus: payment.status,         // your status: PROCESSING / FUNDED / ...
    providerStatus: transaction.status,    // Paystack's: success / abandoned / failed ...
    // Paid at Paystack but webhook hasn't settled yet
    awaitingSettlement:
      transaction.status === "success" && payment.status === "PROCESSING",
    amount: payment.amount,
    clientFee: payment.clientFee,
    currency: payment.currency,
  };
};
module.exports = {
  initializeMilestonePayment,
  calculateFees,
  verifyPayment
};