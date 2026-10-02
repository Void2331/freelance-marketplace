const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const validate = require("../middleware/validateMiddleware");

const {
  createJob,
  getJobs,
  getMyJobs,
  getJobById,
  updateJob,
  deleteJob,
  adminDeleteJob,
  getAllJobsAdmin,
} = require("../controllers/jobController");

const {
  createJobSchema,
  updateJobSchema,
} = require("../validators/jobValidator");

const router = express.Router();

/*
  Client posts a new job
*/
router.post(
  "/",
  protect,
  authorize("CLIENT"),
  validate(createJobSchema),
  createJob
);

/*
  Anyone authenticated can browse open jobs
*/
router.get("/", getJobs);

/*
  Client views their own posted jobs
  NOTE: registered before "/:id" so "my" isn't
  swallowed by the :id param route
*/
router.get("/my", protect, authorize("CLIENT"), getMyJobs);

/*
  Admin: every job, any status.
  Also registered before "/:id" for the same reason.
*/
router.get("/admin/all", protect, authorize("ADMIN"), getAllJobsAdmin);

router.get("/:id", protect, getJobById);

router.patch(
  "/:id",
  protect,
  authorize("CLIENT"),
  validate(updateJobSchema),
  updateJob
);

router.delete("/:id", protect, authorize("CLIENT"), deleteJob);

/*
  Admin moderation: remove any job regardless of owner or status.
  Two segments, so it never collides with the single-segment "/:id" above.
*/
router.delete(
  "/admin/:id",
  protect,
  authorize("ADMIN"),
  adminDeleteJob
);

module.exports = router;
