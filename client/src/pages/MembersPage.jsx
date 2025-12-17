import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMembers } from "../api/members";
import "../styles/MembersPage.css";

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

        <label className="checkboxLabel">
          <input
            type="checkbox"
            checked={devOnly}
            onChange={(e) => setDevOnly(e.target.checked)}
          />
          Dev only
        </label>
      </div>

      <div className="membersGrid">
        {members.map((m) => (
          <Link key={m.id} to={`/members/${m.id}`} className="memberCard">
            <img className="avatar" src={m.picture} alt={m.name} />
            <div className="memberInfo">
              <div className="memberName">{m.name}</div>
              <div className="memberMeta">
                {m.major} • {m.year}
              </div>
              <div className="memberFav">
                Favorite: {m["favorite thing 1"]}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
