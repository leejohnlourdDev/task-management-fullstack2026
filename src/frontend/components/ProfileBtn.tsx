import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProfileBtn.css";
import { removeAuthToken } from "../api/token";

// ProfileBtn: shows profile menu with logout. Clears local auth state
// (token and user) on logout so the app returns to demo mode.
const ProfileBtn: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleLogout = () => {
    removeAuthToken();
    localStorage.removeItem("task_manager_user");
    navigate("/login");
  };

  return (
    <div className="profile-dropdown">
      <button className="profile-btn" onClick={toggleDropdown}>
        Profile ▾
      </button>
      {isOpen && (
        <div className="dropdown-menu">
          <button onClick={() => navigate("/profile")}>Profile</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
};

export default ProfileBtn;
