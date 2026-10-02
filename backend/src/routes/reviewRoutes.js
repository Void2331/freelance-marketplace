const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware.js");

const {
  createReview,
  getProjectReviews,
} = require("../controllers/reviewController.js");

router.post(
  "/projects/:projectId/review",
  protect,
  createReview
);

router.get(
  "/projects/:projectId/reviews",
  protect,
  getProjectReviews
);

module.exports = router;
