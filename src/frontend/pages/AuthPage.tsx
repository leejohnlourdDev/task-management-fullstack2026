import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";
import { login, register } from "../api/authApi";
import { saveAuthToken } from "../api/token";

type AuthMode = "login" | "signup";

interface AuthPageProps {
  mode: AuthMode;
}

// AuthPage: renders login / signup form, calls auth API,
// stores the returned token/user in localStorage and redirects.
const AuthPage: React.FC<AuthPageProps> = ({ mode }) => {
  const [authMode, setAuthMode] = useState<AuthMode>(mode);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleModeChange = (newMode: AuthMode) => {
    setAuthMode(newMode);
    setMessage("");
    navigate(newMode === "login" ? "/login" : "/signup");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    // Send credentials to server (login or register),
    // save returned token and user info, then navigate.
    try {
      if (authMode === "login") {
        const data = await login(formData.email, formData.password);
        saveAuthToken(data.token);
        localStorage.setItem("task_manager_user", JSON.stringify({ id: data.id, name: data.name, email: data.email }));
        localStorage.setItem("task_manager_welcome", "welcome_back");
        setMessage("Login successful. Redirecting...");
        navigate("/homepage");
      } else {
        const data = await register(formData.username, formData.email, formData.password);
        saveAuthToken(data.token);
        localStorage.setItem("task_manager_user", JSON.stringify({ id: data.id, name: data.name, email: data.email }));
        localStorage.setItem("task_manager_welcome", "account_created");
        setMessage("Account created successfully. Redirecting...");
        navigate("/homepage");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setMessage(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{authMode === "login" ? "Login" : "Sign Up"}</h2>
        <form onSubmit={handleSubmit} className="login-form">
          {authMode === "signup" && (
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" className="register-btn" disabled={isLoading}>
            {isLoading ? (authMode === "login" ? "Logging in..." : "Signing up...") : (authMode === "login" ? "Login" : "Sign Up")}
          </button>
        </form>

        <div className="toggle-group">
          <p>
            {authMode === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              type="button"
              className="toggle-link"
              onClick={() => handleModeChange(authMode === "login" ? "signup" : "login")}
            >
              {authMode === "login" ? "Sign Up" : "Login"}
            </button>
          </p>
        </div>

        {message && <p className="login-message">{message}</p>}
      </div>
    </div>
  );
};

export default AuthPage;
