import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProfilePage.css";
import { getProfile } from "../api/authApi";
import { removeAuthToken } from "../api/token";

interface UserProfile {
  id: number;
  name: string;
  email: string;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  const handleLogout = () => {
    removeAuthToken();
    navigate("/login");
  };

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("task_manager_token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const profile = await getProfile(token);
        setUser(profile);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load profile.");
        removeAuthToken();
        navigate("/login");
      }
    };

    loadProfile();
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="profile-container">
      <aside className="sidebar">
        <h2 className="sidebar-title">Dashboard</h2>
        <button className="sidebar-btn" onClick={() => navigate("/homepage")}>Home</button>
        <button className="sidebar-btn" onClick={() => navigate("/dashboard")}>Dashboard</button>
      </aside>

      <main className="main-content">
        <header className="profile-header">
          <h1>Profile</h1>
          <div className="profile-info" ref={dropdownRef}>
            <div className="avatar">{user?.name?.charAt(0) || "U"}</div>
            <span className="profile-name" onClick={toggleDropdown}>
              {user?.name || "User"} ▾
            </span>
            {isDropdownOpen && (
              <div className="profile-dropdown">
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </header>

        {error ? (
          <p className="error-message">{error}</p>
        ) : (
          <section className="profile-section">
            <p>Welcome to your profile page{user ? `, ${user.name}` : ""}.</p>
            <div className="profile-details">
              <div>
                <strong>Name:</strong> {user?.name || "Loading..."}
              </div>
              <div>
                <strong>Email:</strong> {user?.email || "Loading..."}
              </div>
              <div>
                <strong>User ID:</strong> {user?.id || "Loading..."}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
