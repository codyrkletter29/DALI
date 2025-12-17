import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "../styles/ProfilePage.css";

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
    <div className="profilePage">
      <Link to="/members" className="backLink">
        ← Back to members
      </Link>

      <p className="statusText">{status}</p>

      {member && (
        <div className="profileCard">
          <img className="profileAvatar" src={member.picture} alt={member.name} />

          <div className="profileInfo">
            <h2 className="profileName">{member.name}</h2>

            <div className="profileMeta">
              <span>{member.major}</span>
              <span>•</span>
              <span>{member.year}</span>
            </div>

            <div className="factsGrid">
              <div className="fact">
                <div className="factLabel">Home</div>
                <div className="factValue">{member.home}</div>
              </div>
              <div className="fact">
                <div className="factLabel">Birthday</div>
                <div className="factValue">{member.birthday}</div>
              </div>
              <div className="fact">
                <div className="factLabel">Favorite thing</div>
                <div className="factValue">{member["favorite thing 1"]}</div>
              </div>
              <div className="fact">
                <div className="factLabel">Tradition</div>
                <div className="factValue">{member["favorite dartmouth tradition"]}</div>
              </div>
            </div>

            <div className="quoteBox">
              <div className="factLabel">Quote</div>
              <div className="quoteText">{member.quote}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
