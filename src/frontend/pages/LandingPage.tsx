import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LandingPage.css";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Landing Page Title */}
      <h1 className="landing-title">
        TASK <span className="highlight-orange">MANAGER</span>
      </h1>

      {/* Button Section */}
      <div className="button-group">
        {/* Login goes to /login */}
        <button className="btn btn-yellow" onClick={() => navigate("/login")}>
          LOGIN
        </button>

        {/* Get Started goes to homepage */}
        <button className="btn btn-gray" onClick={() => navigate("/homepage") }>
          GET STARTED
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
