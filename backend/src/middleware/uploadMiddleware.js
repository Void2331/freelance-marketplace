const fs = require("fs");
const path = require("path");
const multer = require("multer");

const AppError = require("../utils/AppError.js");

const AVATAR_DIR = path.join(__dirname, "..", "..", "uploads", "avatars");

fs.mkdirSync(AVATAR_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, AVATAR_DIR);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const unique = `${req.user._id}-${Date.now()}${ext}`;

    cb(null, unique);
  },
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new AppError(
        "Only JPEG, PNG, WEBP, or GIF images are allowed",
        400
      )
    );
  }

  cb(null, true);
};

const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
}).single("avatar");

module.exports = uploadAvatar;
