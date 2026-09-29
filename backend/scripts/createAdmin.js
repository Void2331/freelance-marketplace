require("dotenv").config();

const bcrypt = require("bcryptjs");

const connectDB = require("../src/config/db");
const User = require("../src/models/user");

const createAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({
      email: "admin@freelancemarketplace.com"
    });

    if (existingAdmin) {
      console.log("Admin account already exists.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(
      "AdminPassword123",
      12
    );

    const admin = await User.create({
      name: "Platform Admin",
      email: "joshuaezemihediwa@gmail.com",
      password: hashedPassword,
      role: "ADMIN"
    });

    console.log("Admin created successfully.");

    console.log({
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    });

    process.exit(0);
  } catch (error) {
    console.error("Failed to create admin:", error.message);
    process.exit(1);
  }
};

createAdmin();