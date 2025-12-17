import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function ProfilePage() {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [status, setStatus] = useState("Loading profile...");

  useEffect(() => {
    fetch(`http://localhost:4000/api/members/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setMember(data.member);
        setStatus("");
      })
      .catch(() => setStatus("Failed to load profile"));
  }, [id]);

  return (
    <div>
      <Link to="/members">← Back to members</Link>
      <h2>Profile</h2>
      <p>{status}</p>

      {member && (
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          {member.picture && (
            <img
              src={member.picture}
              alt={member.name}
              width={140}
              style={{ borderRadius: 12 }}
            />
          )}

          <div>
            <h3 style={{ marginTop: 0 }}>{member.name}</h3>
            <div>Year: {member.year}</div>
            <div>Major: {member.major}</div>
            <div>Minor: {member.minor}</div>
            <div>Home: {member.home}</div>
            <div style={{ marginTop: 10 }}>
              Favorite thing: {member["favorite thing 1"]}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
