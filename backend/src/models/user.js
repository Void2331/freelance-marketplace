const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      maxlength: 72,
      select: false
    },

    role: {
      type: String,
      enum: ["ADMIN", "CLIENT", "FREELANCER"],
      default: "FREELANCER"
    },

    avatar: {
      type: String,
      default: ""
    },

    bio: {
      type: String,
      default: "",
      maxlength: 1000
    },

    location: {
      type: String,
      default: ""
    },

    skills: {
      type: [String],
      default: []
    },

    hourlyRate: {
      type: Number,
      min: 0,
      default: 0
    },

    isActive: {
      type: Boolean,
      default: true
    },

    // Email verification
    isEmailVerified: {
      type: Boolean,
      default: false
    },

    emailVerificationToken: {
      type: String,
      default: null,
      select: false
    },

    emailVerificationExpires: {
      type: Date,
      default: null,
      select: false
    },

passwordResetToken: {
  type: String,
  default: null,
  select: false
},

passwordResetExpires: {
  type: Date,
  default: null,
  select: false
},

bankAccount: {
  accountName: {
    type: String,
    default: ""
  },

  accountNumber: {
    type: String,
    default: "",
    select: false
  },

  bankCode: {
    type: String,
    default: "",
    select: false
  },

  bankName: {
    type: String,
    default: ""
  },

  isVerified: {
    type: Boolean,
    default: false
  }
},

paystackCustomerCode: {
  type: String,
  default: null
},

paystackSubaccountCode: {
  type: String,
  default: null
},

averageRating: {
  type: Number,
  default: 0,
  min: 0,
  max: 5,
},

reviewCount: {
  type: Number,
  default: 0,
  min: 0,
},

  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema)