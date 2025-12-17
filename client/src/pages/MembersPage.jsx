import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMembers } from "../api/members";

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [devOnly, setDevOnly] = useState(false);

  useEffect(() => {
    setStatus("Loading members...");

    fetchMembers({ search, devOnly })
      .then((data) => {
        setMembers(data.members);
        setStatus(`Loaded ${data.count} members`);
      })
      .catch(() => setStatus("Failed to load members"));
  }, [search, devOnly]);

  return (
    <div>
      <h2>Members</h2>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          style={{ padding: 8, width: 260 }}
        />

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={devOnly}
            onChange={(e) => setDevOnly(e.target.checked)}
          />
          Dev only
        </label>
      </div>

      <p>{status}</p>

      <ul style={{ paddingLeft: 18 }}>
        {members.map((m) => (
          <li key={m.id} style={{ marginBottom: 10 }}>
            <div>
              <Link to={`/members/${m.id}`}>
                <strong>{m.name}</strong>
              </Link>{" "}
              ({m.year})
            </div>
            <div>Major: {m.major}</div>
            <div>Favorite thing: {m["favorite thing 1"]}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
