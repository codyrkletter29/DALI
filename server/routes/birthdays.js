const express = require("express");
const router = express.Router();

const { Member } = require("../models"); // adjust path if your models index is elsewhere

// GET /api/birthdays/upcoming?days=30
// Returns list of members with upcoming birthdays within N days
router.get("/upcoming", async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days, 10) || 30, 365); // Default 30 days, max 365

    // Get all members with birthdays in string format "MM-DD"
    const members = await Member.find(
      { birthday: { $exists: true, $ne: null, $ne: "" } },
      "name birthday email picture roles"
    ).lean();

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const upcoming = members
      .map((member) => {
        if (!member.birthday || typeof member.birthday !== "string") return null;

        // Expect "MM-DD" (e.g. "11-29")
        const parts = member.birthday.split("-");
        if (parts.length !== 2) return null;

        const month = Number(parts[0]);
        const day = Number(parts[1]);

        // Basic validation
        if (!Number.isInteger(month) || !Number.isInteger(day)) return null;
        if (month < 1 || month > 12) return null;
        if (day < 1 || day > 31) return null;

        // Birthday in current year
        let birthdayDate = new Date(startOfToday.getFullYear(), month - 1, day);

        // If already passed, move to next year
        if (birthdayDate < startOfToday) {
          birthdayDate = new Date(startOfToday.getFullYear() + 1, month - 1, day);
        }

        const msPerDay = 1000 * 60 * 60 * 24;
        const daysUntil = Math.round((birthdayDate - startOfToday) / msPerDay);

        return {
          name: member.name,
          birthday: member.birthday, // MM-DD
          daysUntil,
          email: member.email,
          picture: member.picture,
          roles: member.roles,
        };
      })
      .filter(Boolean)
      .filter((m) => m.daysUntil >= 0 && m.daysUntil <= days)
      .sort((a, b) => a.daysUntil - b.daysUntil);

    res.json({
      success: true,
      days,
      count: upcoming.length,
      upcoming,
    });
  } catch (error) {
    console.error("Birthdays/upcoming error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch upcoming birthdays" });
  }
});

module.exports = router;