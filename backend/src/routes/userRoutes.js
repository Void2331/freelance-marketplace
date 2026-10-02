const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const validate = require("../middleware/validateMiddleware");

const {
  updateMyProfile,
  listAllUsers,
  updateUserStatus,
  listFreelancers,
  getUserById,
  getUserReviews,
} = require("../controllers/userController");

const {
  updateProfileSchema,
  updateUserStatusSchema,
} = require("../validators/userValidator");

const router = express.Router();

/*
  Update my own profile.
  NOTE: registered before "/:id" so "me" isn't
  swallowed by the :id param route.

  (Viewing your own profile is already served by
  GET /api/auth/me.)
*/
router.patch(
  "/me",
  protect,
  validate(updateProfileSchema),
  updateMyProfile
);

/*
  Admin: every user, any role.
  NOTE: must stay above "/:id" or "admin" is treated as an id.
*/
router.get("/admin/all", protect, authorize("ADMIN"), listAllUsers);

router.patch(
  "/:id/status",
  protect,
  authorize("ADMIN"),
  validate(updateUserStatusSchema),
  updateUserStatus
);

/*
  Browse / search freelancers
*/
router.get("/", protect, listFreelancers);

router.get("/:id", protect, getUserById);

router.get("/:id/reviews", protect, getUserReviews);

module.exports = router;
