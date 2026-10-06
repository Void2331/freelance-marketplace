const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware.js");
const validate = require("../middleware/validateMiddleware.js");
const objectIdParam = require("../middleware/objectIdParam.js");

const {
  getWorkroom,
} = require("../controllers/workroomController.js");

const {
  submitMilestone,
  requestChanges,
} = require("../controllers/milestoneSubmissionController.js");
const { approveMilestone,} = require("../controllers/milestoneApprovalController");

const {
  submitMilestoneSchema,
  requestChangesSchema,
} = require("../validators/milestoneValidator.js");

/*
  Every path param in this router is a Mongo ObjectId.
*/
router.param("projectId", objectIdParam);
router.param("milestoneId", objectIdParam);

router.get(
  "/projects/:projectId/workroom",
  protect,
  getWorkroom
);

router.post(
  "/milestones/:milestoneId/submit",
  protect,
  validate(submitMilestoneSchema),
  submitMilestone
);

router.post(
  "/milestones/:milestoneId/request-changes",
  protect,
  validate(requestChangesSchema),
  requestChanges
);

router.post(
  "/milestones/:milestoneId/approve",
  protect,
  approveMilestone
);

module.exports = router;
