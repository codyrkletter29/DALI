import { useEffect, useState } from "react";

export default function App() {
  const [members, setMembers] = useState([]);
  const [status, setStatus] = useState("Loading members...");

  useEffect(() => {
    fetch("http://localhost:4000/api/members")
      .then((res) => res.json())
      .then((data) => {
        setMembers(data.members);
        setStatus(`Loaded ${data.count} members`);
      })
      .catch(() => setStatus("Failed to load members (is backend running?)"));
  }, []);

  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <h1>DALI Social</h1>
      <p>{status}</p>

      <ul>
        {members.map((m, idx) => (
          <li key={m.id || m._id || m.name || idx}>
            <strong>{m.name}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
