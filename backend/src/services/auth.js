const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const AppError = require("../utils/AppError");

const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("./email.js");

/*
 * Generate JWT
 */
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
  );
};

/*
 * REGISTER
 *
 * Creates a new Client or Freelancer account
 * and sends an email verification link.
 */
const register = async (userData) => {
  const {
    name,
    email,
    password,
    role,
  } = userData;

  /*
   * Check whether the email already exists.
   */
  const existingUser = await User.findOne({
    email,
  });

  if (existingUser) {
    throw new AppError(
      "An account with this email already exists",
      409,
    );
  }

  /*
   * ADMIN accounts cannot be created
   * through public registration.
   */
  if (role === "ADMIN") {
    throw new AppError(
      "Admin accounts cannot be created through registration",
      403,
    );
  }

  /*
   * Hash password.
   */
  const hashedPassword =
    await bcrypt.hash(password, 12);

  /*
   * Generate secure email verification token.
   *
   * The raw token will be sent by email.
   * Only the hashed token is stored in MongoDB.
   */
  const verificationToken =
    crypto.randomBytes(32).toString("hex");

  const hashedVerificationToken =
    crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

  /*
   * Verification token expires after 15 minutes.
   */
  const verificationExpires =
    new Date(
      Date.now() + 15 * 60 * 1000,
    );

  /*
   * Create user.
   */
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,

    isEmailVerified: false,

    emailVerificationToken:
      hashedVerificationToken,

    emailVerificationExpires:
      verificationExpires,
  });

  /*
   * Send verification email.
   *
   * IMPORTANT:
   * We do NOT delete the account if email
   * sending fails.
   *
   * The user can request another email
   * through /resend-verification.
   */
  try {
    await sendVerificationEmail(
      user.email,
      user.name,
      verificationToken,
    );
  } catch (error) {
    console.error(
      "Verification email error:",
      error,
    );

    throw new AppError(
      "Account created, but we could not send the verification email. Please request a new verification email.",
      500,
    );
  }

  /*
   * Do not issue JWT before email verification.
   */
  return {
    user: {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar ?? null,
      bio: user.bio ?? null,
      location: user.location ?? null,
      skills: user.skills ?? [],
      hourlyRate: user.hourlyRate ?? null,
      isActive: user.isActive,
      isEmailVerified:
        user.isEmailVerified,
      createdAt: user.createdAt,
    },
  };
};

/*
 * VERIFY EMAIL
 *
 * The frontend sends the token received
 * from the verification email.
 */
const verifyEmail = async (token) => {
  if (!token) {
    throw new AppError(
      "Verification token is required",
      400,
    );
  }

  /*
   * Hash the token received from the URL.
   *
   * This allows us to compare it with the
   * hashed token stored in MongoDB.
   */
  const hashedToken =
    crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

  /*
   * Find user whose token matches and
   * whose token has not expired.
   */
  const user = await User.findOne({
    emailVerificationToken:
      hashedToken,

    emailVerificationExpires: {
      $gt: new Date(),
    },
  }).select(
    "+emailVerificationToken +emailVerificationExpires",
  );

  if (!user) {
    throw new AppError(
      "Verification link is invalid or has expired",
      400,
    );
  }

  /*
   * Mark email as verified.
   */
  user.isEmailVerified = true;

  /*
   * Remove verification token.
   *
   * This prevents the same token from
   * being reused.
   */
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;

  await user.save();

  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isEmailVerified:
      user.isEmailVerified,
  };
};

/*
 * RESEND VERIFICATION EMAIL
 */
const resendVerificationEmail =
  async (email) => {
    /*
     * Find user.
     */
    const user =
      await User.findOne({
        email,
      }).select(
        "+emailVerificationToken +emailVerificationExpires",
      );

    if (!user) {
      throw new AppError(
        "No account was found with this email",
        404,
      );
    }

    /*
     * Don't send another verification email
     * if the email is already verified.
     */
    if (user.isEmailVerified) {
      throw new AppError(
        "Your email is already verified",
        400,
      );
    }

    /*
     * Generate a new secure token.
     */
    const verificationToken =
      crypto.randomBytes(32).toString("hex");

    /*
     * Hash token before storing it.
     */
    const hashedVerificationToken =
      crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");

    /*
     * New token expires in 15 minutes.
     */
    user.emailVerificationToken =
      hashedVerificationToken;

    user.emailVerificationExpires =
      new Date(
        Date.now() + 15 * 60 * 1000,
      );

    await user.save();

    /*
     * Send new verification email.
     */
    try {
      await sendVerificationEmail(
        user.email,
        user.name,
        verificationToken,
      );
    } catch (error) {
      console.error(
        "Resend verification email error:",
        error,
      );

      throw new AppError(
        "We could not send the verification email. Please try again later.",
        500,
      );
    }

    return {
      message:
        "A new verification email has been sent",
    };
  };

/*
 * FORGOT PASSWORD
 */
const forgotPassword = async (email) => {
  const user =
    await User.findOne({
      email,
    });

  /*
   * For security, don't reveal whether
   * an email exists in the system.
   */
  if (!user) {
    return {
      message:
        "If an account with that email exists, a password reset link has been sent.",
    };
  }

  /*
   * Generate secure random token.
   */
  const resetToken =
    crypto.randomBytes(32).toString("hex");

  /*
   * Hash token before storing it.
   */
  const hashedResetToken =
    crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

  /*
   * Token expires after 15 minutes.
   */
  user.passwordResetToken =
    hashedResetToken;

  user.passwordResetExpires =
    new Date(
      Date.now() + 15 * 60 * 1000,
    );

  await user.save();

  /*
   * Send password reset email.
   */
  try {
    await sendPasswordResetEmail(
      user.email,
      user.name,
      resetToken,
    );
  } catch (error) {
    console.error(
      "Password reset email error:",
      error,
    );

    /*
     * Remove the reset token if the email
     * could not be sent.
     */
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await user.save();

    throw new AppError(
      "We could not send the password reset email. Please try again later.",
      500,
    );
  }

  return {
    message:
      "If an account with that email exists, a password reset link has been sent.",
  };
};

/*
 * RESET PASSWORD
 */
const resetPassword = async (
  token,
  newPassword,
) => {
  if (!token) {
    throw new AppError(
      "Reset token is required",
      400,
    );
  }

  /*
   * Hash the token received from the
   * frontend.
   */
  const hashedToken =
    crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

  /*
   * Find user with matching token that
   * has not expired.
   */
  const user =
    await User.findOne({
      passwordResetToken:
        hashedToken,

      passwordResetExpires: {
        $gt: new Date(),
      },
    }).select(
      "+passwordResetToken +passwordResetExpires",
    );

  if (!user) {
    throw new AppError(
      "Password reset link is invalid or has expired",
      400,
    );
  }

  /*
   * Hash new password.
   */
  user.password =
    await bcrypt.hash(
      newPassword,
      12,
    );

  /*
   * Remove reset token so it cannot
   * be reused.
   */
  user.passwordResetToken = null;
  user.passwordResetExpires = null;

  await user.save();

  return {
    message:
      "Password reset successfully. You can now log in with your new password.",
  };
};

/*
 * LOGIN
 */
const login = async (
  email,
  password,
) => {
  /*
   * Password has select:false in the
   * User model, so explicitly request it.
   */
  const user =
    await User.findOne({
      email,
    }).select("+password");

  if (!user) {
    throw new AppError(
      "Invalid email or password",
      401,
    );
  }

  /*
   * Check whether account is active.
   */
  if (!user.isActive) {
    throw new AppError(
      "Your account has been deactivated",
      403,
    );
  }

  /*
   * Check password.
   */
  const passwordIsCorrect =
    await bcrypt.compare(
      password,
      user.password,
    );

  if (!passwordIsCorrect) {
    throw new AppError(
      "Invalid email or password",
      401,
    );
  }

  /*
   * Require email verification before
   * issuing JWT.
   */
  if (!user.isEmailVerified) {
    throw new AppError(
      "Please verify your email before logging in",
      403,
    );
  }

  /*
   * Generate JWT.
   */
  const token =
    generateToken(user);

  /*
   * Return a consistent user object.
   *
   * IMPORTANT:
   * We use `_id` everywhere in the frontend
   * and backend API response.
   */
  return {
    user: {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar ?? null,
      bio: user.bio ?? null,
      location: user.location ?? null,
      skills: user.skills ?? [],
      hourlyRate: user.hourlyRate ?? null,
      isActive: user.isActive,
      isEmailVerified:
        user.isEmailVerified,
      createdAt: user.createdAt,
    },

    token,
  };
};

/*
 * GET CURRENT USER
 */
const getMe = async (userId) => {
  const user =
    await User.findById(userId);

  if (!user) {
    throw new AppError(
      "User not found",
      404,
    );
  }

  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar ?? null,
    bio: user.bio ?? null,
    location: user.location ?? null,
    skills: user.skills ?? [],
    hourlyRate: user.hourlyRate ?? null,
    isActive: user.isActive,
    isEmailVerified:
      user.isEmailVerified,
    createdAt: user.createdAt,
  };
};

module.exports = {
  register,
  login,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  getMe,
  generateToken,
};