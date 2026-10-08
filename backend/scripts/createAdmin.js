require("dotenv").config();

const bcrypt = require("bcryptjs");
const connectDB = require("../src/config/db");
const User = require("../src/models/user");

const createAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD before running this script");
    }
    if (password.length < 8) {
      throw new Error("ADMIN_PASSWORD must be at least 8 characters");
    }

    await connectDB();

    if (await User.findOne({ email })) {
      console.log("An account with this email already exists.");
      process.exit(0);
    }

    const admin = await User.create({
      name: "Platform Admin",
      email,
      password: await bcrypt.hash(password, 12),
      role: "ADMIN",
      isEmailVerified: true,
    });

    console.log("Admin created:", { id: admin._id, email: admin.email, role: admin.role });
    process.exit(0);
  } catch (error) {
    console.error("Failed to create admin:", error.message);
    process.exit(1);
  }
};

createAdmin();