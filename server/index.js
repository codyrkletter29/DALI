require("dotenv").config(); // Load .env variables
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const postsRoutes = require("./routes/posts");
const statsRoutes = require("./routes/stats");
const birthdaysRoutes = require("./routes/birthdays");
const mapRouter = require("./routes/map");

const app = express();
app.use(cors());
app.use(express.json()); // lets server read JSON bodies

const { Member } = require("./models");

// Connect to MongoDB on startup
connectDB();

// Mount auth routes
app.use("/api/auth", authRoutes);
// Mount posts routes
app.use("/api/posts", postsRoutes);
// Mount stats routes
app.use("/api/stats", statsRoutes);
// Mount birthday routes
app.use("/api/birthdays", birthdaysRoutes);
// Mount map routes
app.use("/api/map", mapRouter);

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Server is running" });
});

app.get("/api/members", async (req, res) => {
  try {
    const search = (req.query.search || "").toLowerCase();
    const devOnly = req.query.dev === "true";

    // Build query filter
    let filter = {};
    
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }
    
    if (devOnly) {
      filter["roles.dev"] = true;
    }

    const members = await Member.find(filter);

    res.json({
      success: true,
      count: members.length,
      members: members.map((m) => ({
        id: m._id.toString(),
        ...m.toObject(),
      })),
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

app.get("/api/members/:id", async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    res.json({ success: true, member });
  } catch (error) {
    console.error("Error fetching member:", error);
    res.status(500).json({ error: "Failed to fetch member" });
  }
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
