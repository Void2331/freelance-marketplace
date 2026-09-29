const AppError = require("../utils/AppError");
const User = require("../models/user.js");
const Review = require("../models/review.js");

/*
  Fields that are safe to show to anyone
  (other than the account owner themselves).
  Excludes email, bankAccount, Paystack
  identifiers, and every auth/token field.
*/
const PUBLIC_PROFILE_FIELDS =
  "name avatar bio location skills hourlyRate role averageRating reviewCount createdAt";

/*
====================================================
UPDATE MY OWN PROFILE
====================================================
*/
const updateProfile = async (userId, updates) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

/*
====================================================
GET A USER'S PUBLIC PROFILE
====================================================
*/
const getPublicProfile = async (userId) => {
  const user = await User.findById(userId).select(
    PUBLIC_PROFILE_FIELDS
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

/*
====================================================
BROWSE / SEARCH FREELANCERS
Supports optional ?skill=, ?search=, ?minRating=
and basic ?page= / ?limit= pagination
====================================================
*/
const listFreelancers = async (filters = {}) => {
  const query = {
    role: "FREELANCER",
    isActive: true,
  };

  if (filters.skill) {
    query.skills = filters.skill;
  }

  if (filters.search) {
    query.name = {
      $regex: filters.search,
      $options: "i",
    };
  }

  if (filters.minRating) {
    query.averageRating = {
      $gte: Number(filters.minRating),
    };
  }

  const page = Math.max(
    1,
    Number(filters.page) || 1
  );

  const limit = Math.min(
    50,
    Math.max(1, Number(filters.limit) || 20)
  );

  const [freelancers, total] = await Promise.all([
    User.find(query)
      .select(PUBLIC_PROFILE_FIELDS)
      .sort({ averageRating: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),

    User.countDocuments(query),
  ]);

  return {
    freelancers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/*
====================================================
GET A USER'S PUBLIC REVIEWS
====================================================
*/
const getUserReviews = async (userId) => {
  const reviews = await Review.find({
    reviewee: userId,
    isPublic: true,
  })
    .populate("reviewer", "name avatar role")
    .populate("project", "title")
    .sort({ createdAt: -1 });

  return reviews;
};

module.exports = {
  updateProfile,
  getPublicProfile,
  listFreelancers,
  getUserReviews,
};
