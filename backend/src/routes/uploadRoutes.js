const express = require("express");

const protect = require("../middleware/authMiddleware.js");
const upload = require("../middleware/uploadMiddleware.js");

const {
  uploadAvatar,
} = require("../controllers/uploadController.js");

const router = express.Router();

/*
====================================================
UPLOAD AVATAR
====================================================

POST /api/uploads/avatar

Field name:

avatar

Flow:

Client
  ↓
protect
  ↓
Multer
  ↓
req.file.buffer
  ↓
Cloudinary
  ↓
uploadAvatar
  ↓
Cloudinary URL
====================================================
*/
router.post(
  "/uploads/avatar",
  protect,
  upload.single("avatar"),
  uploadAvatar
);

module.exports = router;