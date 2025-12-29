const express = require("express");
const { Member } = require("../models");

const router = express.Router();

// GET /api/members?search=andy&role=dev
router.get("/", async (req, res) => {
  try {
    const search = (req.query.search || "").trim();
    const role = req.query.role;

    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    if (role) {
      const allowedRoles = ["dev", "des", "pm", "core", "mentor"];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          error: `Invalid role. Must be one of: ${allowedRoles.join(", ")}`,
        });
      }
      filter[`roles.${role}`] = true;
    }

    const members = await Member.find(filter).lean();

    res.json({
      success: true,
      count: members.length,
      members: members.map((m) => ({
        id: m._id.toString(),
        ...m,
      })),
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

// GET /api/members/:id
router.get("/:id", async (req, res) => {
  try {
    const member = await Member.findById(req.params.id).lean();

    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    res.json({ success: true, member });
  } catch (error) {
    console.error("Error fetching member:", error);
    res.status(500).json({ error: "Failed to fetch member" });
  }
});

// GET /api/members/:id/similar?limit=5
router.get("/:id/similar", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || "5", 10), 20);

    const base = await Member.findById(req.params.id)
      .select("name year major minor roles homeLocation picture")
      .lean();

    if (!base) return res.status(404).json({ error: "Member not found" });

    const candidates = await Member.find({ _id: { $ne: base._id } })
      .select("name year major minor roles homeLocation picture")
      .lean();

    const scoreCandidate = (a, b) => {
      let score = 0;
      const reasons = [];

      if (a.major && b.major && a.major === b.major) {
        score += 4;
        reasons.push("same major");
      }

      if (a.minor && b.minor && a.minor === b.minor) {
        score += 2;
        reasons.push("same minor");
      }

      if (a.year && b.year && a.year === b.year) {
        score += 1;
        reasons.push("same year");
      }

      const roles = ["dev", "des", "pm", "core", "mentor"];
      for (const r of roles) {
        if (a.roles?.[r] && b.roles?.[r]) {
          score += 2;
          reasons.push(`both ${r}`);
        }
      }

      const aState = a.homeLocation?.state;
      const bState = b.homeLocation?.state;
      if (aState && bState && aState === bState) {
        score += 1;
        reasons.push("same state");
      }

      return { score, reasons };
    };

    const ranked = candidates
      .map((c) => {
        const { score, reasons } = scoreCandidate(base, c);
        return {
          memberId: c._id.toString(),
          name: c.name,
          picture: c.picture ?? null,
          year: c.year ?? null,
          major: c.major ?? null,
          score,
          reasons,
        };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    res.json({
      memberId: base._id.toString(),
      baseMember: { name: base.name },
      count: ranked.length,
      similar: ranked,
    });
  } catch (err) {
    console.error("GET /api/members/:id/similar error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
