const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Get MongoDB URI from environment variable or use local MongoDB
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/dali-social";

    await mongoose.connect(mongoURI);

    console.log("✓ MongoDB connected successfully");
    return true;
  } catch (error) {
    console.error("✗ MongoDB connection failed:", error.message);
    process.exit(1); // Exit if connection fails
  }
};

module.exports = connectDB;
