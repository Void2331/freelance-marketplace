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


module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};