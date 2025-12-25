import { Routes, Route, Link, useLocation } from "react-router-dom";
import MembersPage from "./pages/MembersPage";
import ProfilePage from "./pages/ProfilePage";
import FeedPage from "./pages/FeedPage";
import SignupPage from "./pages/SignupPage";

import "./styles/App.css";

export default function App() {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  return (
    <div className="appShell">
      <header className="appHeader">
        <Link to="/members" className="brand">
          DALI Social
        </Link>
        <nav className="navLinks">
          <Link to="/members">Members</Link>
          <Link to="/feed">Feed</Link>
          <Link to="/signup">Sign up</Link>
        </nav>
      </header>

      <main className="appMain">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/members/:id" element={<ProfilePage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </main>
    </div>
  );
}
