import { Routes, Route, Navigate, Link } from "react-router-dom";
import MembersPage from "./pages/MembersPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  return (
    <div style={{ fontFamily: "system-ui", padding: 24, maxWidth: 900 }}>
      <header style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>DALI Social</h1>
        <Link to="/members">Members</Link>
      </header>

      <Routes>
        <Route path="/" element={<Navigate to="/members" replace />} />
        <Route path="/members" element={<MembersPage />} />
        <Route path="/members/:id" element={<ProfilePage />} />
      </Routes>
    </div>
  );
}
