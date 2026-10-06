const express = require("express");

const protect = require("../middleware/authMiddleware.js");
const validate = require("../middleware/validateMiddleware.js");

const {
  getMyNotifications,
} = require("../controllers/notificationController.js");

const {
  listNotificationsQuerySchema,
} = require("../validators/notificationValidator.js");

const router = express.Router();

router.get(
  "/notifications",
  protect,
  validate(listNotificationsQuerySchema, "query"),
  getMyNotifications
);

module.exports = router;
