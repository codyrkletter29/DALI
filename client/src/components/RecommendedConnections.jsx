import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSimilarMembers } from "../api/members";
import "../styles/RecommendedConnections.css";

export default function RecommendedConnections({ currentUserId }) {
  const [similar, setSimilar] = useState([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUserId) return;

    setLoading(true);
    fetchSimilarMembers(currentUserId, 10)
      .then((data) => {
        setSimilar(data.similar || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch similar members:", err);
        setLoading(false);
      });
  }, [currentUserId]);

  const handleScrollRight = () => {
    setScrollPosition((prev) => Math.min(prev + 1, similar.length - 1));
  };

  const handleScrollLeft = () => {
    setScrollPosition((prev) => Math.max(prev - 1, 0));
  };

  const handleMemberClick = (memberId) => {
    navigate(`/members/${memberId}`);
  };

  if (loading) {
    return (
      <div className="recommendedConnections">
        <h3 className="recommendedTitle">Recommended Connections</h3>
        <p className="recommendedLoading">Loading recommendations...</p>
      </div>
    );
  }

  if (!similar || similar.length === 0) {
    return null;
  }

  // Show 4 items at a time
  const itemsPerView = 4;
  const visibleMembers = similar.slice(
    scrollPosition,
    scrollPosition + itemsPerView
  );
  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = scrollPosition + itemsPerView < similar.length;

  return (
    <div className="recommendedConnections">
      <h3 className="recommendedTitle">Recommended Connections</h3>
      <div className="carouselContainer">
        {canScrollLeft && (
          <button
            className="carouselArrow carouselArrowLeft"
            onClick={handleScrollLeft}
            aria-label="Scroll left"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        <div className="carouselTrack">
          {visibleMembers.map((member) => (
            <div
              key={member.memberId}
              className="recommendedCard"
              onClick={() => handleMemberClick(member.memberId)}
            >
              <img
                className="recommendedAvatar"
                src={member.picture || "/default-avatar.png"}
                alt={member.name}
              />
              <div className="recommendedInfo">
                <div className="recommendedName">{member.name}</div>
                <div className="recommendedMeta">
                  {member.major && <span>{member.major}</span>}
                  {member.major && member.year && <span> • </span>}
                  {member.year && <span>{member.year}</span>}
                </div>
                {member.reasons && member.reasons.length > 0 && (
                  <div className="recommendedReasons">
                    {member.reasons.slice(0, 2).map((reason, idx) => (
                      <span key={idx} className="reasonBadge">
                        {reason}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {canScrollRight && (
          <button
            className="carouselArrow carouselArrowRight"
            onClick={handleScrollRight}
            aria-label="Scroll right"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}