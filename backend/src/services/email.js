const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 465,
  secure: true,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});


const sendVerificationEmail =
  async (
    email,
    name,
    token
  ) => {

    const verificationUrl =
      `${process.env.CLIENT_URL}/verify-email?token=${token}`;


    await transporter.sendMail({
      from:
        `"Freelance Marketplace" <${process.env.EMAIL_FROM}>`,

      to: email,

      subject:
        "Verify your Freelance Marketplace account",

      html: `
        <!DOCTYPE html>

        <html>

          <body
            style="
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            "
          >

            <h2>
              Welcome to Freelance Marketplace,
              ${name}!
            </h2>

            <p>
              Thank you for creating your account.
            </p>

            <p>
              Please verify your email address
              by clicking the button below:
            </p>

            <p>
              <a
                href="${verificationUrl}"
                style="
                  display: inline-block;
                  padding: 12px 20px;
                  background: #2563eb;
                  color: #ffffff;
                  text-decoration: none;
                  border-radius: 6px;
                "
              >
                Verify My Email
              </a>
            </p>

            <p>
              This verification link will expire
              in 15 minutes.
            </p>

            <p>
              If you did not create this account,
              you can safely ignore this email.
            </p>

            <p>
              Regards,<br>
              Freelance Marketplace Team
            </p>

          </body>

        </html>
      `
    });
  };


/*
 * Send password reset email
 */
const sendPasswordResetEmail =
  async (
    email,
    name,
    token
  ) => {

    const resetUrl =
      `${process.env.CLIENT_URL}/reset-password?token=${token}`;


    await transporter.sendMail({
      from:
        `"Freelance Marketplace" <${process.env.EMAIL_FROM}>`,

      to: email,

      subject:
        "Reset your Freelance Marketplace password",

      html: `
        <!DOCTYPE html>

        <html>

          <body
            style="
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            "
          >

            <h2>
              Password Reset Request
            </h2>

            <p>
              Hello ${name},
            </p>

            <p>
              We received a request to reset
              the password for your
              Freelance Marketplace account.
            </p>

            <p>
              Click the button below to create
              a new password:
            </p>

            <p>
              <a
                href="${resetUrl}"
                style="
                  display: inline-block;
                  padding: 12px 20px;
                  background: #2563eb;
                  color: #ffffff;
                  text-decoration: none;
                  border-radius: 6px;
                "
              >
                Reset My Password
              </a>
            </p>

            <p>
              This link will expire in
              15 minutes.
            </p>

            <p>
              If you did not request a password
              reset, you can safely ignore this
              email.
            </p>

            <p>
              Your password will not change unless
              you use the link above to create a
              new password.
            </p>

            <p>
              Regards,<br>
              Freelance Marketplace Team
            </p>

          </body>

        </html>
      `
    });
  };


/*
====================================================
IN-APP EVENT NOTIFICATION EMAILS
====================================================

Shared template + a named function per event. Unlike
the verify/reset emails above (where delivery IS the
point of the request), these fire as a side effect of
some other action succeeding — a new proposal, a
funded milestone, etc. A broken mail server should
never fail that underlying action, so every function
below catches and logs its own errors instead of
throwing.
*/

const sendEventEmail = async ({
  to,
  subject,
  heading,
  bodyHtml,
  ctaUrl,
  ctaLabel,
}) => {
  try {
    await transporter.sendMail({
      from: `"Freelance Marketplace" <${process.env.EMAIL_FROM}>`,

      to,

      subject,

      html: `
        <!DOCTYPE html>

        <html>

          <body
            style="
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            "
          >

            <h2>${heading}</h2>

            ${bodyHtml}

            ${
              ctaUrl
                ? `
              <p>
                <a
                  href="${ctaUrl}"
                  style="
                    display: inline-block;
                    padding: 12px 20px;
                    background: #2563eb;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 6px;
                  "
                >
                  ${ctaLabel || "View on Freelance Marketplace"}
                </a>
              </p>
            `
                : ""
            }

            <p>
              Regards,<br>
              Freelance Marketplace Team
            </p>

          </body>

        </html>
      `,
    });
  } catch (error) {
    console.error(
      `Failed to send "${subject}" email to ${to}:`,
      error.message
    );
  }
};

const sendNewProposalEmail = async (
  clientEmail,
  clientName,
  jobTitle,
  freelancerName,
  jobId
) => {
  await sendEventEmail({
    to: clientEmail,

    subject: `New proposal on "${jobTitle}"`,

    heading: `Hi ${clientName}, you have a new proposal`,

    bodyHtml: `
      <p>
        ${freelancerName} submitted a proposal for
        your job "${jobTitle}".
      </p>
    `,

    ctaUrl: `${process.env.CLIENT_URL}/client/jobs/${jobId}/proposals`,

    ctaLabel: "Review proposal",
  });
};

const sendProposalAcceptedEmail = async (
  freelancerEmail,
  freelancerName,
  jobTitle,
  projectId
) => {
  await sendEventEmail({
    to: freelancerEmail,

    subject: `Your proposal for "${jobTitle}" was accepted`,

    heading: `Congratulations, ${freelancerName}!`,

    bodyHtml: `
      <p>
        Your proposal for "${jobTitle}" was accepted.
        The client is funding the first milestone now —
        you'll be notified as soon as it's ready to start.
      </p>
    `,

    ctaUrl: `${process.env.CLIENT_URL}/projects/${projectId}`,

    ctaLabel: "View project",
  });
};

const sendMilestoneFundedEmail = async (
  freelancerEmail,
  freelancerName,
  milestoneTitle,
  amount,
  currency,
  projectId
) => {
  await sendEventEmail({
    to: freelancerEmail,

    subject: `Milestone funded: ${milestoneTitle}`,

    heading: `A milestone was funded, ${freelancerName}`,

    bodyHtml: `
      <p>
        "${milestoneTitle}" (${currency} ${amount.toLocaleString()})
        has been funded and is held in escrow. You can start work now.
      </p>
    `,

    ctaUrl: `${process.env.CLIENT_URL}/projects/${projectId}`,

    ctaLabel: "Start work",
  });
};

const sendMilestoneSubmittedEmail = async (
  clientEmail,
  clientName,
  milestoneTitle,
  projectId
) => {
  await sendEventEmail({
    to: clientEmail,

    subject: `Milestone ready for review: ${milestoneTitle}`,

    heading: `Hi ${clientName}, work is ready for review`,

    bodyHtml: `
      <p>
        "${milestoneTitle}" has been submitted for your review.
      </p>
    `,

    ctaUrl: `${process.env.CLIENT_URL}/projects/${projectId}`,

    ctaLabel: "Review submission",
  });
};

const sendMilestoneApprovedEmail = async (
  freelancerEmail,
  freelancerName,
  milestoneTitle,
  amount,
  currency,
  projectId
) => {
  await sendEventEmail({
    to: freelancerEmail,

    subject: `Payment released: ${milestoneTitle}`,

    heading: `Payment released, ${freelancerName}!`,

    bodyHtml: `
      <p>
        Your milestone "${milestoneTitle}" was approved and
        ${currency} ${amount.toLocaleString()} has been released
        to your wallet.
      </p>
    `,

    ctaUrl: `${process.env.CLIENT_URL}/projects/${projectId}`,

    ctaLabel: "View project",
  });
};

const sendDisputeOpenedEmail = async (
  recipientEmail,
  recipientName,
  milestoneTitle,
  projectId
) => {
  await sendEventEmail({
    to: recipientEmail,

    subject: `A dispute was opened: ${milestoneTitle}`,

    heading: `Hi ${recipientName}, a dispute was opened`,

    bodyHtml: `
      <p>
        A dispute was opened on the milestone "${milestoneTitle}".
        Our team will review it — you can add context from the
        project page in the meantime.
      </p>
    `,

    ctaUrl: `${process.env.CLIENT_URL}/projects/${projectId}`,

    ctaLabel: "View project",
  });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendNewProposalEmail,
  sendProposalAcceptedEmail,
  sendMilestoneFundedEmail,
  sendMilestoneSubmittedEmail,
  sendMilestoneApprovedEmail,
  sendDisputeOpenedEmail,
};