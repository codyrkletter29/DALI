const express = require("express");
const { Member } = require("../models");

const router = express.Router();

/**
 * GET /api/map/hometowns
 * Query params (optional):
 * - role=dev|des|pm|core|mentor
 * - year=2024 (or any year)
 * - hasCoords=true (default true)
 * - limit=500 (default 500, max 2000)
 *
 * Returns frontend-friendly map points:
 * [{ memberId, name, year, roles, home, city, state, lat, lng, picture }]
 */
router.get("/hometowns", async (req, res) => {
  try {
    const {
      role,
      year,
      hasCoords = "true",
      limit = "500",
    } = req.query;

    const safeLimit = Math.min(parseInt(limit, 10) || 500, 2000);

    const query = {};

    if (year) query.year = year;

    if (role) {
      const allowed = ["dev", "des", "pm", "core", "mentor"];
      if (!allowed.includes(role)) {
        return res.status(400).json({
          error: `Invalid role. Must be one of: ${allowed.join(", ")}`,
        });
      }
      query[`roles.${role}`] = true;
    }

    if (hasCoords === "true") {
      query["homeLocation.lat"] = { $ne: null };
      query["homeLocation.lng"] = { $ne: null };
    }

    const members = await Member.find(query)
      .select("name year roles home picture homeLocation")
      .limit(safeLimit)
      .lean();

    const points = members
      .map((m) => {
        const hl = m.homeLocation || {};
        return {
          memberId: m._id,
          name: m.name,
          year: m.year,
          roles: m.roles,
          home: m.home,
          city: hl.city ?? null,
          state: hl.state ?? null,
          lat: hl.lat ?? null,
          lng: hl.lng ?? null,
          picture: m.picture ?? null,
          source: hl.source ?? "none",
        };
      })
      // If hasCoords=false, you may still want to keep null coords.
      // If you always want map points only, uncomment filter below:
      // .filter(p => p.lat !== null && p.lng !== null)
      ;

    res.json({ count: points.length, points });
  } catch (err) {
    console.error("GET /api/map/hometowns error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
