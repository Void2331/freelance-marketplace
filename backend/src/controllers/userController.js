const asyncHandler = require("../utils/asyncHandler");
const userService = require("../services/user.js");
const User = require("../models/user.js");

/*
====================================================
UPDATE MY OWN PROFILE
====================================================
*/
const updateMyProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(
    req.user._id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: { user },
  });
});

/*
====================================================
BROWSE / SEARCH FREELANCERS
====================================================
*/
const listFreelancers = asyncHandler(async (req, res) => {
  const result = await userService.listFreelancers({
    skill: req.query.skill,
    search: req.query.search,
    minRating: req.query.minRating,
    page: req.query.page,
    limit: req.query.limit,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});

/*
====================================================
GET A USER'S PUBLIC PROFILE
====================================================
*/
const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getPublicProfile(
    req.params.id
  );

  res.status(200).json({
    success: true,
    data: { user },
  });
});

/*
====================================================
GET A USER'S PUBLIC REVIEWS
====================================================
*/
const getUserReviews = asyncHandler(async (req, res) => {
  const reviews = await userService.getUserReviews(
    req.params.id
  );

  res.status(200).json({
    success: true,
    data: { reviews },
  });
});

/*
====================================================
ADMIN: LIST EVERY USER (any role)
====================================================
*/
const listAllUsers = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(req.query.limit, 10) || 25, 1),
    100
  );

  const filter = {};

  if (["CLIENT", "FREELANCER", "ADMIN"].includes(req.query.role)) {
    filter.role = req.query.role;
  }

  if (req.query.search) {
    const escaped = String(req.query.search).replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    filter.$or = [
      { name: { $regex: escaped, $options: "i" } },
      { email: { $regex: escaped, $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    },
  });
});

/*
====================================================
ADMIN: ACTIVATE / DEACTIVATE A USER
Deactivating flips User.isActive, which authMiddleware
already checks on every request, so it takes effect on
the user's very next call.
====================================================
*/
const updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (id === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: "You cannot change your own account status",
    });
  }

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  if (user.role === "ADMIN") {
    return res.status(400).json({
      success: false,
      message: "Admin accounts cannot be deactivated from here",
    });
  }

  user.isActive = isActive;
  await user.save();

  res.status(200).json({
    success: true,
    message: isActive
      ? "User account reactivated"
      : "User account deactivated",
    data: { user },
  });
});

module.exports = {
  listAllUsers,
  updateUserStatus,
  updateMyProfile,
  listFreelancers,
  getUserById,
  getUserReviews,
};
