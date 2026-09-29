const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware.js");
const authorize = require("../middleware/roleMiddleware.js");

const {
  openDispute,
  resolveDispute,
  listDisputes,
  getProjectDisputes,
} = require("../controllers/disputeController.js");

router.post(
  "/milestones/:milestoneId/dispute",
  protect,
  openDispute
);

router.patch(
  "/disputes/:disputeId/resolve",
  protect,
  authorize("ADMIN"),
  resolveDispute
);

router.get(
  "/disputes",
  protect,
  authorize("ADMIN"),
  listDisputes
);

router.get(
  "/projects/:projectId/disputes",
  protect,
  getProjectDisputes
);

module.exports = router;