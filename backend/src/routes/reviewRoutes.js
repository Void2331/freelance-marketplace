const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware.js");
const validate = require("../middleware/validateMiddleware.js");
const objectIdParam = require("../middleware/objectIdParam.js");

const {
  createReview,
  getProjectReviews,
} = require("../controllers/reviewController.js");

const {
  createReviewSchema,
} = require("../validators/reviewValidator.js");

/*
  Every path param in this router is a Mongo ObjectId.
*/
router.param("projectId", objectIdParam);

router.post(
  "/projects/:projectId/review",
  protect,
  validate(createReviewSchema),
  createReview
);

router.get(
  "/projects/:projectId/reviews",
  protect,
  getProjectReviews
);

module.exports = router;
