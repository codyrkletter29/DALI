// Member directory with search and filtering developed with ChatGPT assistance
import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { fetchMembers } from "../api/members";
import { AuthContext } from "../context/AuthContext";
import RecommendedConnections from "../components/RecommendedConnections";
import "../styles/MembersPage.css";

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  
  // Safely access AuthContext - it might not be provided
  let user = null;
  try {
    const context = useContext(AuthContext);
    user = context?.user;
  } catch (e) {
    // AuthContext not provided, user will remain null
  }

  // Fetch members whenever search or role filter changes
  useEffect(() => {
    setStatus("Loading members...");

    fetchMembers({ search, role: roleFilter })
      .then((data) => {
        setMembers(data.members);
        setStatus(`Loaded ${data.count} members`);
      })
      .catch(() => setStatus("Failed to load members"));
  }, [search, roleFilter]);

  // Use current user's memberId if available, otherwise use first member's ID
  const currentUserId = user?.memberId || (members.length > 0 ? members[0].id : null);

  return (
    <div className="membersPage">
      <div className="membersTop">
        <h2 className="pageTitle">Members</h2>
        <p className="pageSub">{status}</p>
      </div>

      <div className="controls">
        <input
          className="searchInput"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
        />

        <select
          className="roleSelector"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="dev">Developer</option>
          <option value="des">Designer</option>
          <option value="pm">Product Manager</option>
          <option value="core">Core Team</option>
          <option value="mentor">Mentor</option>
        </select>
      </div>

      {/* Grid of member cards */}
      <div className="membersGrid">
        {members.map((m) => {
          // Build roles array from member data
          const roles = [];
          if (m.roles?.dev) roles.push("Developer");
          if (m.roles?.des) roles.push("Designer");
          if (m.roles?.pm) roles.push("PM");
          if (m.roles?.core) roles.push("Core");
          if (m.roles?.mentor) roles.push("Mentor");
          
          return (
            <Link key={m.id} to={`/members/${m.id}`} className="memberCard">
              <img className="avatar" src={m.picture} alt={m.name} />
              <div className="memberInfo">
                <div className="memberName">{m.name}</div>
                <div className="memberMeta">
                  {m.major} • {m.year}
                </div>
                {roles.length > 0 && (
                  <div className="memberRoles">{roles.join(", ")}</div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Show recommended connections if user is logged in */}
      {currentUserId && <RecommendedConnections currentUserId={currentUserId} />}
    </div>
  );
}
