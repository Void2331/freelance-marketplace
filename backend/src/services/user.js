const AppError = require("../utils/AppError");
const User = require("../models/user.js");
const Review = require("../models/review.js");
const {
  getTrustScore,
  getTrustScores,
} = require("./trustScore.js");

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

  const profile = user.toObject();

  // Trust only makes sense for freelancers.
  if (user.role === "FREELANCER") {
    profile.trust = await getTrustScore(user._id);
  }

  return profile;
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

  /*
  --------------------------------------------------
  GET TRUST SCORES FOR ALL FREELANCERS
  --------------------------------------------------
  */
  const trust = await getTrustScores(
    freelancers.map(
      (freelancer) => freelancer._id
    )
  );

  return {
    freelancers: freelancers.map((freelancer) => ({
      ...freelancer.toObject(),
      trust: trust[String(freelancer._id)],
    })),
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