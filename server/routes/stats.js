const express = require("express");
const { Member } = require("../models");

const router = express.Router();

// GET /api/stats/roles
router.get("/roles", async (req, res) => {
  try {
    const [dev, des, pm, core, mentor, total] = await Promise.all([
      Member.countDocuments({ "roles.dev": true }),
      Member.countDocuments({ "roles.des": true }),
      Member.countDocuments({ "roles.pm": true }),
      Member.countDocuments({ "roles.core": true }),
      Member.countDocuments({ "roles.mentor": true }),
      Member.countDocuments({}),
    ]);

    res.json({ success: true, stats: { dev, des, pm, core, mentor, total } });
  } catch (error) {
    console.error("Stats/roles error:", error);
    res.status(500).json({ error: "Failed to fetch role statistics" });
  }
});


// GET /api/stats/majors
// Returns count of members by major for bar chart
router.get("/majors", async (req, res) => {
  try {
    const majors = await Member.aggregate([
      {
        $match: { major: { $exists: true, $ne: null } },
      },
      {
        $group: {
          _id: "$major",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    res.json({
      success: true,
      stats: majors.map((item) => ({
        major: item._id,
        count: item.count,
      })),
      total: majors.reduce((sum, item) => sum + item.count, 0),
    });
  } catch (error) {
    console.error("Stats/majors error:", error);
    res.status(500).json({ error: "Failed to fetch major statistics" });
  }
});

// GET /api/stats/class-years
// Returns count of members by class year for timeline/histogram
router.get("/class-years", async (req, res) => {
  try {
    const years = await Member.aggregate([
      {
        $match: { year: { $exists: true, $ne: null } },
      },
      {
        $group: {
          _id: "$year",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 }, // Sort by year ascending
      },
    ]);

    res.json({
      success: true,
      stats: years.map((item) => ({
        year: item._id,
        count: item.count,
      })),
      total: years.reduce((sum, item) => sum + item.count, 0),
    });
  } catch (error) {
    console.error("Stats/class-years error:", error);
    res.status(500).json({ error: "Failed to fetch class year statistics" });
  }
});
/**
 * GET /api/map/home-states
 * Returns counts of members by state (only those with a parsed state).
 * Query params (optional):
 * - role=dev|des|pm|core|mentor
 * - year=2024
 */
router.get("/home-states", async (req, res) => {
  try {
    const { role, year } = req.query;

    const match = {};

    if (year) match.year = year;

    if (role) {
      const allowed = ["dev", "des", "pm", "core", "mentor"];
      if (!allowed.includes(role)) {
        return res.status(400).json({
          error: `Invalid role. Must be one of: ${allowed.join(", ")}`,
        });
      }
      match[`roles.${role}`] = true;
    }

    // Only count members who have a state
    match["homeLocation.state"] = { $ne: null };

    const results = await Member.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$homeLocation.state",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Convert to object for frontend convenience
    const counts = {};
    for (const r of results) {
      counts[r._id] = r.count;
    }

    res.json({ states: counts, totalStates: results.length });
  } catch (err) {
    console.error("GET /api/map/home-states error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;