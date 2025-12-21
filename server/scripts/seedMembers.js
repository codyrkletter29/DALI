const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const { Member } = require("../models");
const connectDB = require("../config/db");

const seedMembers = async () => {
  try {
    await connectDB();
    
    // Read the JSON file
    const dataPath = path.join(__dirname, "../data/dali_social_media.json");
    const membersData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
    
    // Clear existing members (optional - comment out to preserve)
    // await Member.deleteMany({});
    
    // Insert members from JSON
    const inserted = await Member.insertMany(membersData, { ordered: false }).catch(err => {
      // Ignore duplicate key errors
      if (err.code === 11000) {
        console.warn("⚠ Some members already exist, skipping duplicates");
        return err.result?.insertedDocs || [];
      }
      throw err;
    });
    
    console.log(`✓ Seeded ${inserted.length} members into database`);
    process.exit(0);
  } catch (error) {
    console.error("✗ Seeding failed:", error.message);
    process.exit(1);
  }
};

seedMembers();
