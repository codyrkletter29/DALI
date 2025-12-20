import { Routes, Route, Navigate, Link } from "react-router-dom";
import MembersPage from "./pages/MembersPage";
import ProfilePage from "./pages/ProfilePage";
import FeedPage from "./pages/FeedPage";

import "./styles/App.css";

export default function App() {
  return (
    <div className="appShell">
      <header className="appHeader">
        <Link to="/members" className="brand">
          DALI Social
        </Link>
        <nav className="navLinks">
          <Link to="/members">Members</Link>
          <Link to="/feed">Feed</Link>
        </nav>
      </header>

      <main className="appMain">
        <Routes>
          <Route path="/" element={<Navigate to="/members" replace />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/members/:id" element={<ProfilePage />} />
        </Routes>
      </main>
    </div>
  );
}
