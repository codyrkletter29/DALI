const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // Allow null values, but unique if not null
    },
    year: {
      type: String,
      enum: ["2024", "2025", "2026", "2027"],
    },
    major: String,
    minor: String,
    roles: {
      dev: { type: Boolean, default: false },
      des: { type: Boolean, default: false },
      pm: { type: Boolean, default: false },
      core: { type: Boolean, default: false },
      mentor: { type: Boolean, default: false },
    },
    birthday: String, // Format: MM-DD
    home: String,
    quote: String,
    favorites: {
      thing1: String,
      thing2: String,
      thing3: String,
      dartmouthTradition: String,
    },
    funFact: String,
    picture: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Member", memberSchema);
