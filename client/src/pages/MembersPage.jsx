import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMembers } from "../api/members";
import "../styles/MembersPage.css";

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    setStatus("Loading members...");

    fetchMembers({ search, role: roleFilter })
      .then((data) => {
        setMembers(data.members);
        setStatus(`Loaded ${data.count} members`);
      })
      .catch(() => setStatus("Failed to load members"));
  }, [search, roleFilter]);

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

      <div className="membersGrid">
        {members.map((m) => {
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
    </div>
  );
}
