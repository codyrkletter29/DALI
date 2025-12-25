import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/LoginPage.css";

const BASE_URL =
  import.meta.env.VITE_API_BASE ??
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:4000");

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("");
    setError("");

    try {
      setStatus("Logging in...");
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      setStatus("Welcome back!");
      navigate("/members");
    } catch (err) {
      setError(err.message || "Login failed.");
      setStatus("");
    }
  };

  return (
    <div className="loginPage">
      <header className="loginHeader">
        <h2 className="pageTitle">Log in</h2>
        <p className="pageSub">Access your DALI Social account.</p>
      </header>

      <form className="loginForm" onSubmit={handleSubmit}>
        <label className="formField">
          <span className="requiredLabel">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@dartmouth.edu"
            required
          />
        </label>
        <label className="formField">
          <span className="requiredLabel">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Your password"
            required
          />
        </label>

        <div className="formActions">
          <button type="submit">Log in</button>
          <Link className="textLink" to="/signup">
            Need an account? Sign up
          </Link>
        </div>

        {(status || error) && (
          <div className="formStatus" aria-live="polite">
            {status && <p className="statusMessage">{status}</p>}
            {error && <p className="errorMessage">{error}</p>}
          </div>
        )}
      </form>
    </div>
  );
}
