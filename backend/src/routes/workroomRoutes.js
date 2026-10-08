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

const {
  approveMilestone,
} = require("../controllers/milestoneApprovalController.js");

const upload = require("../middleware/uploadMiddleware.js");

const {
  uploadDeliverables,
  getMilestoneSubmissions,
} = require("../controllers/deliverableController");

const {
  uploadDeliverables: uploadDeliverablesMiddleware,
} = require("../middleware/deliverableUploadMiddleware");

const {
  submitMilestoneSchema,
  requestChangesSchema,
} = require("../validators/milestoneValidator.js");

/*
  Every path param in this router is a Mongo ObjectId.
*/
router.param("projectId", objectIdParam);
router.param("milestoneId", objectIdParam);

/*
====================================================
GET PROJECT WORKROOM
====================================================
GET /api/projects/:projectId/workroom
*/
router.get(
  "/projects/:projectId/workroom",
  protect,
  getWorkroom
);

/*
====================================================
SUBMIT MILESTONE
====================================================
POST /api/milestones/:milestoneId/submit

The frontend sends multipart/form-data containing:

message
attachments[]

Multer receives up to 5 files and stores them
temporarily in memory.

The controller then uploads those files to
Cloudinary.
*/
router.post(
  "/milestones/:milestoneId/submit",
  protect,
  upload.array("attachments", 5),
  validate(submitMilestoneSchema),
  submitMilestone
);

/*
====================================================
REQUEST MILESTONE CHANGES
====================================================
POST /api/milestones/:milestoneId/request-changes
*/
router.post(
  "/milestones/:milestoneId/request-changes",
  protect,
  validate(requestChangesSchema),
  requestChanges
);

/*
====================================================
APPROVE MILESTONE
====================================================
POST /api/milestones/:milestoneId/approve
*/
router.post(
  "/milestones/:milestoneId/approve",
  protect,
  approveMilestone
);

/*
====================================================
UPLOAD DELIVERABLES
====================================================
POST /api/milestones/:milestoneId/deliverables/upload
*/
router.post(
  "/milestones/:milestoneId/deliverables/upload",
  protect,
  uploadDeliverablesMiddleware.array(
    "files",
    10,
  ),
  uploadDeliverables,
);

/*
====================================================
GET MILESTONE SUBMISSIONS
====================================================
GET /api/milestones/:milestoneId/submissions
*/
router.get(
  "/milestones/:milestoneId/submissions",
  protect,
  getMilestoneSubmissions,
);

module.exports = router;