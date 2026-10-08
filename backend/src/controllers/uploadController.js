const asyncHandler = require("../utils/asyncHandler.js");
const AppError = require("../utils/AppError.js");

const uploadToCloudinary = require("../utils/cloudinaryUpload.js");

/*
====================================================
UPLOAD AVATAR
====================================================

Multer stores the uploaded image in memory.

Cloudinary then uploads the buffer and returns the
permanent secure URL.

The frontend can use the returned URL when updating
the user's profile.
====================================================
*/
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("No file was uploaded", 400);
  }

  /*
  ================================================
  Upload image to Cloudinary
  ================================================
  */
  const result = await uploadToCloudinary(
    req.file.buffer,
    {
      folder: "freelance-marketplace/avatars",
      resource_type: "image",
    }
  );

  /*
  ================================================
  Return Cloudinary URL
  ================================================
  */
  res.status(200).json({
    success: true,
    message: "Avatar uploaded successfully",
    data: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });
});

module.exports = {
  uploadAvatar,
};