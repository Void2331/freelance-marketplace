const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware.js");

const {
  getWorkroom,
} = require("../controllers/workroomController.js");

const {
  submitMilestone,
  requestChanges,
} = require("../controllers/milestoneSubmissionController.js");
const { approveMilestone,} = require("../controllers/milestoneApprovalController");

router.get(
  "/projects/:projectId/workroom",
  protect,
  getWorkroom
);

router.post(
  "/milestones/:milestoneId/submit",
  protect,
  submitMilestone
);

router.post(
  "/milestones/:milestoneId/request-changes",
  protect,
  requestChanges
);

router.post(
  "/milestones/:milestoneId/approve",
  protect,
  approveMilestone
);

module.exports = router;