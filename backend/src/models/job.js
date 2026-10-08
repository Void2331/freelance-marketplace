const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      minlength: 5,
      maxlength: 150,
    },

    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
      minlength: 20,
      maxlength: 5000,
    },

    category: {
      type: String,
      trim: true,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    budget: {
      type: Number,
      required: [true, "Budget is required"],
      min: 1,
    },

    budgetType: {
      type: String,
      enum: ["FIXED", "HOURLY"],
      default: "FIXED",
    },

    currency: {
      type: String,
      default: "NGN",
      uppercase: true,
      trim: true,
    },

    deadline: {
      type: Date,
      default: null,
    },

    /*
      Optional payment plan the client drafted (often with the
      AI planner). Shown to freelancers so they can bid knowing
      how the work will be paid. Percentages total 100.
    */
    milestonePlan: {
      type: [
        {
          _id: false,
          title: { type: String, trim: true, maxlength: 100, required: true },
          description: { type: String, trim: true, maxlength: 400, default: "" },
          percentage: { type: Number, min: 1, max: 100, required: true },
        },
      ],
      default: [],
    },

    status: {
      type: String,
      enum: ["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "OPEN",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

jobSchema.index({ status: 1, createdAt: -1 });

module.exports =
  mongoose.models.Job || mongoose.model("Job", jobSchema);
