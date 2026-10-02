const asyncHandler = require("../utils/asyncHandler.js");
const AppError = require("../utils/AppError.js");

/*
====================================================
UPLOAD AVATAR
Requires uploadMiddleware (multer) to already have
run, populating req.file. Only returns a URL —
saving it to the user's profile happens through the
existing PATCH /users/me, so this stays a simple
"upload a file, get a URL back" endpoint.
====================================================
*/
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("No file was uploaded", 400);
  }

  const url = `${req.protocol}://${req.get("host")}/uploads/avatars/${
    req.file.filename
  }`;

  res.status(200).json({
    success: true,
    message: "Avatar uploaded",
    data: { url },
  });
});

module.exports = {
  uploadAvatar,
};
