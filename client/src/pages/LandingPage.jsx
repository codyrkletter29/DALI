import { Link } from "react-router-dom";
import daliLogo from "../assets/dali-logo.svg";
import "../styles/LandingPage.css";

export default function LandingPage() {
  return (
    <div className="landingPage">
      <section className="landingHero">
        <div className="landingHeroHeader">
          <img
            className="landingLogo"
            src={daliLogo}
            alt="DALI logo"
            loading="lazy"
          />
          <div className="landingHeroHeading">
            <p className="landingEyebrow">DALI Social</p>
            <span className="landingTagline">Member connections, amplified.</span>
          </div>
        </div>

        <div className="landingHeroContent">
          <div className="landingCopy">
            <h1>Meet, connect, and grow with the DALI community.</h1>
            <p className="landingLead">
              DALI Social is a home for DALI members — developers, PMs, and UI/UX
              designers — to meet one another, stay connected through posts, and
              discover shared connections.
            </p>
            <div className="landingActions">
              <Link className="primaryButton" to="/login">
                Log in
              </Link>
              <Link className="secondaryButton" to="/signup">
                Sign up
              </Link>
            </div>
          </div>
          <div className="landingInfoCard">
            <h3>What you can do</h3>
            <ul>
              <li>Share project updates and wins across studios.</li>
              <li>Find fellow members by role, class year, and interests.</li>
              <li>Start conversations that turn into collaborations.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="landingHighlights">
        <div>
          <h3>Stay connected</h3>
          <p>Share updates and keep up with DALI projects and milestones.</p>
        </div>
        <div>
          <h3>Find your people</h3>
          <p>Explore members by role, interests, and class year.</p>
        </div>
        <div>
          <h3>Build momentum</h3>
          <p>Turn introductions into collaborations across studios and teams.</p>
        </div>
      </section>
    </div>
  );
}
