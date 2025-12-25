import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SignupPage.css";

const BASE_URL =
  import.meta.env.VITE_API_BASE ??
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:4000");

const emptyRoles = {
  dev: false,
  des: false,
  pm: false,
  core: false,
  mentor: false,
};

export default function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [major, setMajor] = useState("");
  const [minor, setMinor] = useState("");
  const [year, setYear] = useState("");
  const [birthday, setBirthday] = useState("");
  const [home, setHome] = useState("");
  const [quote, setQuote] = useState("");
  const [favoriteThing1, setFavoriteThing1] = useState("");
  const [favoriteThing2, setFavoriteThing2] = useState("");
  const [favoriteThing3, setFavoriteThing3] = useState("");
  const [favoriteTradition, setFavoriteTradition] = useState("");
  const [funFact, setFunFact] = useState("");
  const [picture, setPicture] = useState("");
  const [roles, setRoles] = useState(emptyRoles);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [nameChecked, setNameChecked] = useState(false);
  const [nameExists, setNameExists] = useState(false);

  const trimmedName = useMemo(() => name.trim(), [name]);

  const resetNameCheck = (nextName) => {
    setName(nextName);
    setNameChecked(false);
    setNameExists(false);
    setStatus("");
    setError("");
  };

  const handleRoleChange = (key) => (event) => {
    setRoles((prev) => ({
      ...prev,
      [key]: event.target.checked,
    }));
  };

  const checkName = async () => {
    setError("");
    if (!trimmedName) {
      setError("Please enter your name.");
      return false;
    }

    try {
      setStatus("Checking name...");
      const response = await fetch(
        `${BASE_URL}/api/auth/check-name?name=${encodeURIComponent(
          trimmedName
        )}`
      );
      if (!response.ok) {
        throw new Error("Name check failed");
      }
      const data = await response.json();
      const match = Boolean(data.exists);
      setNameChecked(true);
      setNameExists(match);
      setStatus(
        match
          ? "We found a matching member record."
          : "No matching member found. Please complete the full profile."
      );
      return true;
    } catch (err) {
      setError("Unable to check name. Please try again.");
      setStatus("");
      return false;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!nameChecked) {
      await checkName();
      return;
    }

    if (!email || !password || !trimmedName) {
      setError("Name, email, and password are required.");
      return;
    }

    const rolesSelected = Object.values(roles).some(Boolean);

    if (
      !nameExists &&
      (!major ||
        !minor ||
        !year ||
        !birthday ||
        !home ||
        !quote ||
        !favoriteThing1 ||
        !favoriteThing2 ||
        !favoriteThing3 ||
        !favoriteTradition ||
        !funFact ||
        !picture ||
        !rolesSelected)
    ) {
      setError("Please fill out all required fields.");
      return;
    }

    const payload = {
      name: trimmedName,
      email,
      password,
    };

    if (!nameExists) {
      payload.major = major;
      payload.minor = minor;
      payload.year = year;
      payload.birthday = birthday;
      payload.home = home;
      payload.quote = quote;
      payload.picture = picture;
      payload.roles = roles;
      payload.favorites = {
        thing1: favoriteThing1,
        thing2: favoriteThing2,
        thing3: favoriteThing3,
        dartmouthTradition: favoriteTradition,
      };
      payload.funFact = funFact;
    }

    try {
      setStatus("Creating your account...");
      const response = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      setStatus("Signup successful! Redirecting...");
      navigate("/members");
    } catch (err) {
      setError(err.message || "Signup failed.");
      setStatus("");
    }
  };

  return (
    <div className="signupPage">
      <header className="signupHeader">
        <h2 className="pageTitle">Sign up</h2>
        <p className="pageSub">Create your DALI Social account.</p>
      </header>

      <form className="signupForm" onSubmit={handleSubmit}>
        <div className="formGrid">
          <label className="formField">
            <span className="requiredLabel">Name</span>
            <input
              value={name}
              onChange={(event) => resetNameCheck(event.target.value)}
              placeholder="Full name"
              required
            />
          </label>
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
              placeholder="At least 6 characters"
              required
              minLength={6}
            />
          </label>
        </div>

        {!nameChecked && (
          <div className="formActions">
            <button type="button" onClick={checkName}>
              Continue
            </button>
          </div>
        )}

        {nameChecked && nameExists && (
          <div className="formSection">
            <p className="infoCallout">
              Looks like we already have a member profile for you. Confirm to
              link it to your new login.
            </p>
            <div className="formActions">
              <button type="submit">Confirm signup</button>
            </div>
          </div>
        )}

        {nameChecked && !nameExists && (
          <div className="formSection">
            <h3 className="sectionTitle">Step 2: Profile details</h3>
            <p className="infoCallout">
              We couldn’t find an existing member profile. Tell us a bit more so
              we can create one.
            </p>
            <div className="formGrid">
              <label className="formField">
                <span className="requiredLabel">Major</span>
                <input
                  value={major}
                  onChange={(event) => setMajor(event.target.value)}
                  placeholder="Computer Science"
                  required
                />
              </label>
              <label className="formField">
                <span className="requiredLabel">Minor</span>
                <input
                  value={minor}
                  onChange={(event) => setMinor(event.target.value)}
                  placeholder="Design"
                  required
                />
              </label>
              <label className="formField">
                <span className="requiredLabel">Year</span>
                <input
                  value={year}
                  onChange={(event) => setYear(event.target.value)}
                  placeholder="2026"
                  required
                />
              </label>
              <label className="formField">
                <span className="requiredLabel">Birthday</span>
                <input
                  value={birthday}
                  onChange={(event) => setBirthday(event.target.value)}
                  placeholder="MM-DD"
                  required
                />
              </label>
              <label className="formField">
                <span className="requiredLabel">Home</span>
                <input
                  value={home}
                  onChange={(event) => setHome(event.target.value)}
                  placeholder="San Francisco, CA"
                  required
                />
              </label>
              <label className="formField">
                <span className="requiredLabel">Quote</span>
                <textarea
                  value={quote}
                  onChange={(event) => setQuote(event.target.value)}
                  placeholder="Your favorite quote"
                  rows={3}
                  required
                />
              </label>
              <label className="formField">
                <span className="requiredLabel">Favorite thing 1</span>
                <input
                  value={favoriteThing1}
                  onChange={(event) => setFavoriteThing1(event.target.value)}
                  placeholder="Favorite thing"
                  required
                />
              </label>
              <label className="formField">
                <span className="requiredLabel">Favorite thing 2</span>
                <input
                  value={favoriteThing2}
                  onChange={(event) => setFavoriteThing2(event.target.value)}
                  placeholder="Favorite thing"
                  required
                />
              </label>
              <label className="formField">
                <span className="requiredLabel">Favorite thing 3</span>
                <input
                  value={favoriteThing3}
                  onChange={(event) => setFavoriteThing3(event.target.value)}
                  placeholder="Favorite thing"
                  required
                />
              </label>
              <label className="formField">
                <span className="requiredLabel">
                  Favorite Dartmouth tradition
                </span>
                <input
                  value={favoriteTradition}
                  onChange={(event) => setFavoriteTradition(event.target.value)}
                  placeholder="Homecoming"
                  required
                />
              </label>
              <label className="formField">
                <span className="requiredLabel">Fun fact</span>
                <textarea
                  value={funFact}
                  onChange={(event) => setFunFact(event.target.value)}
                  placeholder="Share a fun fact"
                  rows={3}
                  required
                />
              </label>
              <label className="formField">
                <span className="requiredLabel">Picture URL</span>
                <input
                  type="url"
                  value={picture}
                  onChange={(event) => setPicture(event.target.value)}
                  placeholder="https://"
                  required
                />
              </label>
            </div>

            <fieldset className="rolesFieldset">
              <legend className="requiredLabel">Roles</legend>
              <label>
                <input
                  type="checkbox"
                  checked={roles.dev}
                  onChange={handleRoleChange("dev")}
                />
                Dev
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={roles.des}
                  onChange={handleRoleChange("des")}
                />
                Design
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={roles.pm}
                  onChange={handleRoleChange("pm")}
                />
                PM
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={roles.core}
                  onChange={handleRoleChange("core")}
                />
                Core
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={roles.mentor}
                  onChange={handleRoleChange("mentor")}
                />
                Mentor
              </label>
            </fieldset>

            <div className="formActions">
              <button type="submit">Create account</button>
            </div>
          </div>
        )}

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
