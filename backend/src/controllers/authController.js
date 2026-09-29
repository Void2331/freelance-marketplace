
const authService =
  require("../services/auth.js");

const asyncHandler =
  require("../utils/asyncHandler.js");


/*
 * Register
 */
const register =
  asyncHandler(
    async (req, res) => {

      const result =
        await authService.register(
          req.body
        );


      res.status(201).json({
        success: true,

        message:
          "Account created successfully. Please check your email to verify your account.",

        data: result
      });
    }
  );


/*
 * Login
 */
const login =
  asyncHandler(
    async (req, res) => {

      const {
        email,
        password
      } = req.body;


      const result =
        await authService.login(
          email,
          password
        );


      res.status(200).json({
        success: true,

        message:
          "Login successful",

        data: result
      });
    }
  );


/*
 * Verify email
 */
const verifyEmail =
  asyncHandler(
    async (req, res) => {

      const {
        token
      } = req.query;


      const user =
        await authService.verifyEmail(
          token
        );


      res.status(200).json({
        success: true,

        message:
          "Email verified successfully",

        data: {
          user
        }
      });
    }
  );


/*
 * Resend verification email
 */
const resendVerificationEmail =
  asyncHandler(
    async (req, res) => {

      const {
        email
      } = req.body;


      const result =
        await authService
          .resendVerificationEmail(
            email
          );


      res.status(200).json({
        success: true,

        message:
          result.message
      });
    }
  );

/*
 * Forgot password
 */
const forgotPassword =
  asyncHandler(
    async (req, res) => {

      const {
        email
      } = req.body;


      const result =
        await authService
          .forgotPassword(email);


      res.status(200).json({
        success: true,
        message: result.message
      });
    }
  );


/*
 * Reset password
 */
const resetPassword =
  asyncHandler(
    async (req, res) => {

      const {
        token,
        password
      } = req.body;


      const result =
        await authService.resetPassword(
          token,
          password
        );


      res.status(200).json({
        success: true,
        message: result.message
      });
    }
  );

/*
 * Get current user
 */
const getMe =
  asyncHandler(
    async (req, res) => {

      const user =
        await authService.getMe(
          req.user._id
        );


      res.status(200).json({
        success: true,

        data: {
          user
        }
      });
    }
  );


module.exports = {
  register,
  login,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  getMe
};
