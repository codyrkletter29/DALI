export default function MemberProfileCard({ member }) {
  if (!member) return null;
  const { favorites = {}, roles = {} } = member;
  const { thing1, thing2, thing3, dartmouthTradition } = favorites;

  // Build roles array
  const memberRoles = [];
  if (roles.dev) memberRoles.push("Developer");
  if (roles.des) memberRoles.push("Designer");
  if (roles.pm) memberRoles.push("Product Manager");
  if (roles.core) memberRoles.push("Core Team");
  if (roles.mentor) memberRoles.push("Mentor");

  return (
    <div className="profileCard">
      <img className="profileAvatar" src={member.picture} alt={member.name} />

      <div className="profileInfo">
        <h2 className="profileName">{member.name}</h2>

        <div className="profileMeta">
          <span>{member.major || "Undeclared"}</span>
          <span>•</span>
          <span>{member.year || "Year TBD"}</span>
        </div>

        {memberRoles.length > 0 && (
          <div className="profileRoles">
            {memberRoles.map((role, idx) => (
              <span key={idx} className="roleBadge">
                {role}
              </span>
            ))}
          </div>
        )}

        <div className="factsGrid">
          <div className="fact">
            <div className="factLabel">Home</div>
            <div className="factValue">{member.home || "—"}</div>
          </div>

          <div className="fact">
            <div className="factLabel">Birthday</div>
            <div className="factValue">{member.birthday || "—"}</div>
          </div>

          <div className="fact">
            <div className="factLabel">Favorites</div>
            <div className="factValue">
              <ul className="favoritesList">
                {thing1 && <li>{thing1}</li>}
                {thing2 && <li>{thing2}</li>}
                {thing3 && <li>{thing3}</li>}
                {!thing1 && !thing2 && !thing3 && <li>—</li>}
              </ul>
            </div>
          </div>

          <div className="fact">
            <div className="factLabel">Dartmouth Tradition</div>
            <div className="factValue">
              {dartmouthTradition || "—"}
            </div>
          </div>
        </div>

        <div className="quoteBox">
          <div className="factLabel">Quote</div>
          <div className="quoteText">{member.quote || "—"}</div>
        </div>
      </div>
    </div>
  );
}
