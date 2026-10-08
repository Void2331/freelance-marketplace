const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  generateDisputeBrief,
} = require("../controllers/disputeBriefController.js");

const router = express.Router();

// Every briefing costs money: limit each admin, not each IP address.
const briefLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 40,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => String(req.user._id),
  message: {
    success: false,
    message: "Too many AI briefings this hour. Please try again later.",
  },
});

const protect = require("../middleware/authMiddleware.js");
const authorize = require("../middleware/roleMiddleware.js");
const validate = require("../middleware/validateMiddleware.js");
const objectIdParam = require("../middleware/objectIdParam.js");

const {
  openDispute,
  resolveDispute,
  listDisputes,
  getProjectDisputes,
} = require("../controllers/disputeController.js");

const {
  openDisputeSchema,
  resolveDisputeSchema,
  listDisputesQuerySchema,
} = require("../validators/disputeValidator.js");

/*
  Every path param in this router is a Mongo ObjectId.
*/
router.param("milestoneId", objectIdParam);
router.param("disputeId", objectIdParam);
router.param("projectId", objectIdParam);

router.post(
  "/milestones/:milestoneId/dispute",
  protect,
  validate(openDisputeSchema),
  openDispute
);

router.patch(
  "/disputes/:disputeId/resolve",
  protect,
  authorize("ADMIN"),
  validate(resolveDisputeSchema),
  resolveDispute
);

router.post(
  "/disputes/:disputeId/brief",
  protect,
  authorize("ADMIN"),
  briefLimiter,
  generateDisputeBrief
);

router.get(
  "/disputes",
  protect,
  authorize("ADMIN"),
  validate(listDisputesQuerySchema, "query"),
  listDisputes
);

router.get(
  "/projects/:projectId/disputes",
  protect,
  getProjectDisputes
);

module.exports = router;
