require("dotenv").config(); // Load .env variables
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const postsRoutes = require("./routes/posts");
const statsRoutes = require("./routes/stats");
const birthdaysRoutes = require("./routes/birthdays");
const membersRoutes = require("./routes/members");

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
// Mount members routes
app.use("/api/members", membersRoutes);

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Server is running" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
