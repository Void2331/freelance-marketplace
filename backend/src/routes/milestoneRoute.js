const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const validate = require("../middleware/validateMiddleware");

const {
  createMilestone,
  getProjectMilestones,
  getMilestoneById,
  updateMilestone,
  deleteMilestone,
  startMilestone,
  rejectMilestone
} = require("../controllers/milestoneController");

const {
  createMilestoneSchema,
  updateMilestoneSchema
} = require("../validators/milestoneValidator");

const router = express.Router();


/*
====================================================
PROJECT MILESTONES
====================================================
*/

/*
  Client creates milestone
*/
router.post(
  "/projects/:projectId/milestones",
  protect,
  authorize("CLIENT"),
  validate(createMilestoneSchema),
  createMilestone
);


/*
  Client or Freelancer views milestones
*/
router.get(
  "/projects/:projectId/milestones",
  protect,
  authorize("CLIENT", "FREELANCER"),
  getProjectMilestones
);


/*
====================================================
SINGLE MILESTONE
====================================================
*/

router.get(
  "/milestones/:id",
  protect,
  authorize("CLIENT", "FREELANCER"),
  getMilestoneById
);


/*
  Client updates milestone
*/
router.patch(
  "/milestones/:id",
  protect,
  authorize("CLIENT"),
  validate(updateMilestoneSchema),
  updateMilestone
);


/*
  Client deletes milestone
*/
router.delete(
  "/milestones/:id",
  protect,
  authorize("CLIENT"),
  deleteMilestone
);


/*
====================================================
FREELANCER ACTIONS
====================================================
*/

/*
  Freelancer starts milestone
*/
router.patch(
  "/milestones/:id/start",
  protect,
  authorize("FREELANCER"),
  startMilestone
);


/*
  NOTE: submit and approve used to live here as
  PATCH /milestones/:id/submit and
  PATCH /milestones/:id/approve, duplicating the
  workroom routes below with an incompatible
  implementation. They've been removed - use:
    POST /api/milestones/:milestoneId/submit
    POST /api/milestones/:milestoneId/approve
  (registered in workroomRoutes.js)
*/


/*
====================================================
CLIENT ACTIONS
====================================================
*/

/*
  Client rejects milestone
*/
router.patch(
  "/milestones/:id/reject",
  protect,
  authorize("CLIENT"),
  rejectMilestone
);


module.exports = router;
