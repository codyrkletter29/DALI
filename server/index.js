const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json()); // lets server read JSON bodies

const fs = require("fs");
const path = require("path");

function loadMembers() {
  const filePath = path.join(__dirname, "data", "dali_social_media.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Server is running" });
});

app.get("/api/members", (req, res) => {
  const members = loadMembers().map((m, idx) => ({
    id: idx.toString(),
    ...m,
  }));

  const search = (req.query.search || "").toLowerCase();
  const filtered = search
    ? members.filter((m) => (m.name || "").toLowerCase().includes(search))
    : members;

  res.json({ count: filtered.length, members: filtered });
});

app.get("/api/members/:id", (req, res) => {
  const members = loadMembers().map((m, idx) => ({
    id: idx.toString(),
    ...m,
  }));

  const member = members.find((m) => m.id === req.params.id);

  if (!member) {
    return res.status(404).json({ error: "Member not found" });
  }

  res.json({ member });
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
