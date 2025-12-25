import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { useCallback } from "react";
import MembersPage from "./pages/MembersPage";
import ProfilePage from "./pages/ProfilePage";
import FeedPage from "./pages/FeedPage";
import SignupPage from "./pages/SignupPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";

import "./styles/App.css";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const hideHeaderRoutes = new Set(["/", "/login", "/signup"]);
  const shouldShowHeader = !hideHeaderRoutes.has(location.pathname);
  const handleLogout = useCallback(() => {
    localStorage.removeItem("user");
    navigate("/");
  }, [navigate]);

  return (
    <div className="appShell">
      {shouldShowHeader && (
        <header className="appHeader">
          <Link to="/members" className="brand">
            DALI Social
          </Link>
        <nav className="nav">
          <Link to="/members" className="navItem">Members</Link>
          <Link to="/feed" className="navItem">Feed</Link>
          <button
            type="button"
            className="navItem navItemLogout"
            onClick={handleLogout}
          >
            Log out
          </button>
        </nav>
        </header>
      )}

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
