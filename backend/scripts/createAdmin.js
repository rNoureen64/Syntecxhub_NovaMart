
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");

async function createAdmin() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from .env");
    }

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password || password.length < 12) {
      throw new Error(
        "Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters in .env"
      );
    }

    await mongoose.connect(process.env.MONGO_URI);

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      existingUser.role = "admin";
      await existingUser.save();
      console.log("Existing user promoted to admin.");
    } else {
      const hashedPassword = await bcrypt.hash(password, 12);

      await User.create({
        name: "NovaMart Admin",
        email: normalizedEmail,
        password: hashedPassword,
        role: "admin"
      });

      console.log("Admin account created successfully.");
    }
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();
