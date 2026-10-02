const express = require("express");

const protect = require("../middleware/authMiddleware.js");
const uploadAvatarMiddleware = require("../middleware/uploadMiddleware.js");

const {
  uploadAvatar,
} = require("../controllers/uploadController.js");

const router = express.Router();

router.post(
  "/uploads/avatar",
  protect,
  uploadAvatarMiddleware,
  uploadAvatar
);

module.exports = router;
