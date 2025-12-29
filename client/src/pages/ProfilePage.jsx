import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchMember } from "../api/members";
import MemberProfileCard from "../components/MemberProfileCard";
import "../styles/ProfilePage.css";

export default function ProfilePage() {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [status, setStatus] = useState("Loading profile...");

  useEffect(() => {
    fetchMember(id)
      .then((data) => data.member)
      .then((data) => {
        setMember(data);
        setStatus("");
      })
      .catch(() => setStatus("Failed to load profile"));
  }, [id]);

  return (
    <div className="profilePage">
      <Link to="/members" className="backLink">
        ← Back to members
      </Link>

      <p className="statusText">{status}</p>

      {member && <MemberProfileCard member={member} />}
    </div>
  );
}
