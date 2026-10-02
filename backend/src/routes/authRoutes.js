const express = require("express");

const {
  register,
  login,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  getMe
} = require("../controllers/authController.js");

const protect =
  require("../middleware/authMiddleware.js");

const validate =
  require("../middleware/validateMiddleware.js");

const {
  registerSchema,
  loginSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} = require("../validators/authValidator.js");


const router = express.Router();


/*
 * Public registration
 */
router.post(
  "/register",
  validate(registerSchema),
  register
);


/*
 * Verify email
 */
router.get(
  "/verify-email",
  verifyEmail
);


/*
 * Resend verification email
 */
router.post(
  "/resend-verification",
  validate(resendVerificationSchema),
  resendVerificationEmail
);


/*
 * Public login
 */
router.post(
  "/login",
  validate(loginSchema),
  login
);

/*
 * Forgot password
 */
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  forgotPassword
);


/*
 * Reset password
 */
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  resetPassword
);

/*
 * Get currently authenticated user
 */
router.get(
  "/me",
  protect,
  getMe
);


module.exports = router;
