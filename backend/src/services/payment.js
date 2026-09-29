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

  const existingPayment =
    await Payment.findOne({
      milestone: milestone._id,
      status: {
        $in: [
          "PROCESSING",
          "FUNDED"
        ]
      }
    });

  if (existingPayment) {
    throw new AppError(
      "This milestone already has an active payment",
      400
    );
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

const verifyPayment = async (reference) => {
  const payment = await Payment.findOne({
    providerReference: reference
  });

  if (!payment) {
    throw new AppError(
      "Payment record not found",
      404
    );
  }

  const response = await paystack.get(
    `/transaction/verify/${reference}`
  );

  const transaction =
    response.data.data;

  /*
  |--------------------------------------------------------------------------
  | Verify Amount
  |--------------------------------------------------------------------------
  */

  const expectedAmount =
    Math.round(
      (payment.amount +
        payment.clientFee) *
        100
    );

  if (
    Number(transaction.amount) !==
    expectedAmount
  ) {
    throw new AppError(
      "Payment amount mismatch",
      400
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Return Verification Result
  |--------------------------------------------------------------------------
  */

  return {
    payment,

    transaction: {
      status:
        transaction.status,

      reference:
        transaction.reference,

      amount:
        transaction.amount,

      currency:
        transaction.currency,

      id:
        transaction.id
    }
  };
};

module.exports = {
  initializeMilestonePayment,
  calculateFees,
  verifyPayment
};