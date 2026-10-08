const express = require("express");
const rateLimit = require("express-rate-limit");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const validate = require("../middleware/validateMiddleware");

const {
  suggestMilestonePlan,
} = require("../controllers/aiController");

const {
  milestonePlanRequestSchema,
} = require("../validators/aiValidator");

const router = express.Router();

/*
  Every call costs money, so limit each signed-in user
  (not each IP address) to a sensible number per hour.
*/
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => String(req.user._id),
  message: {
    success: false,
    message: "You have used the AI planner a lot this hour. Please try again later.",
  },
});

router.post(
  "/milestone-plan",
  protect,
  authorize("CLIENT"),
  aiLimiter,
  validate(milestonePlanRequestSchema),
  suggestMilestonePlan
);

module.exports = router;
