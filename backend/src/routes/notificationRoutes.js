const express = require("express");

const protect = require("../middleware/authMiddleware.js");

const {
  getMyNotifications,
} = require("../controllers/notificationController.js");

const router = express.Router();

router.get("/notifications", protect, getMyNotifications);

module.exports = router;
