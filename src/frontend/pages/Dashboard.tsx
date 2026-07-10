import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "../styles/Dashboard.css";
import { getTasks } from "../api/taskApi";

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

// Dashboard: visualizes task status and lists tasks for the authenticated user.
// Expects a valid auth token; otherwise redirects to login.
const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState<string | null>(null);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  const handleLogout = () => {
    localStorage.removeItem("task_manager_token");
    navigate("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("task_manager_token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Read the locally stored user (set at login/signup) to personalize header
    const stored = localStorage.getItem("task_manager_user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setUserName(u?.name ?? null);
      } catch {}
    }

    const loadTasks = async () => {
      try {
        const data = await getTasks();
        setTasks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load tasks.");
      }
    };

    loadTasks();
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

  const filteredTasks =
    filter === "All"
      ? tasks
      : tasks.filter((item) =>
          filter === "Active"
            ? item.completed
            : filter === "Inactive"
            ? !item.completed
            : true
        );

  const statusCounts = ["Active", "Inactive"].map((status) => ({
    status,
    count:
      status === "Active"
        ? tasks.filter((task) => task.completed).length
        : tasks.filter((task) => !task.completed).length,
  }));

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2 className="sidebar-title">Dashboard</h2>
        <button className="sidebar-btn" onClick={() => navigate("/homepage")}>Home</button>
        <button className="sidebar-btn" onClick={() => navigate("/profile")}>Profile</button>
      </aside>

      <main className="main-content">
        <header className="profile-header">
          <h1>Dashboard</h1>
          <div className="profile-info" ref={dropdownRef}>
              <div className="avatar">{userName ? userName.charAt(0).toUpperCase() : "U"}</div>
              <span className="profile-name" onClick={toggleDropdown}>
                {userName ?? "User"} ▾
              </span>
            {isDropdownOpen && (
              <div className="profile-dropdown">
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </header>

        {error && <p className="error-message">{error}</p>}

        <section className="graph-section">
          <h2>Task Status Histogram</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusCounts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#28a745" name="Tasks" barSize={50} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className="dashboard-section">
          <div className="filter-bar">
            <label htmlFor="status-filter">Filter by status:</label>
            <select id="status-filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <table className="dashboard-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.title}</td>
                  <td>
                    <span className={`status ${item.completed ? "active" : "inactive"}`}>
                      {item.completed ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
