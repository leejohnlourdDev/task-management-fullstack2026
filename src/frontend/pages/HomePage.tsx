import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/HomePage.css";

import AddTaskButton from "../components/AddTaskButton";
import SearchBar from "../components/SearchBar";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import FilterTask from "../components/FilterTask";
import SearchNotif from "../components/SearchNotif";
import ProfileBtn from "../components/ProfileBtn";

import { useStateManagement } from "../components/logic/StateManagement";
import { TaskOperations } from "../components/logic/TaskOperations";
import { useSearchNotifications } from "../components/logic/SearchNotifications";
import { getTasks } from "../api/taskApi";

// HomePage: displays tasks, handles demo (unauthenticated) mode
// and authenticated mode. Uses local handlers for demo users and
// API-backed handlers for signed-in users. Responsible for
// search, filtering, modal viewing and task operations wiring.
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // State
  const {
    tasks, setTasks,
    searchTerm, setSearchTerm,
    filter, setFilter,
    selectedTask, setSelectedTask,
    isModalOpen, setIsModalOpen,
    viewMode, setViewMode,
    notifMessage, setNotifMessage,
    fadeOut, setFadeOut
  } = useStateManagement();

  useEffect(() => {
    const token = localStorage.getItem("task_manager_token");

    if (!token) {
      // Public demo mode: start with empty task list; user may add demo tasks locally
      // (no API calls are made). This keeps demo behavior isolated from authenticated data.
      setIsAuthenticated(false);
      setTasks([] as any);
      // Show welcome message if coming from signup/login
      const welcome = localStorage.getItem("task_manager_welcome");
      if (welcome === "account_created") {
        setNotifMessage("Account created successfully. Welcome!");
        localStorage.removeItem("task_manager_welcome");
      } else if (welcome === "welcome_back") {
        const stored = localStorage.getItem("task_manager_user");
        const name = stored ? (() => { try { return JSON.parse(stored).name } catch { return null } })() : null;
        setNotifMessage(`Welcome back${name ? ", " + name : ""}!`);
        localStorage.removeItem("task_manager_welcome");
      }
      return;
    }

    setIsAuthenticated(true);
    // If we arrived here from auth, show welcome message
    const welcome = localStorage.getItem("task_manager_welcome");
    if (welcome === "account_created") {
      setNotifMessage("Account created successfully. Welcome!");
      localStorage.removeItem("task_manager_welcome");
    } else if (welcome === "welcome_back") {
      const stored = localStorage.getItem("task_manager_user");
      const name = stored ? (() => { try { return JSON.parse(stored).name } catch { return null } })() : null;
      setNotifMessage(`Welcome back${name ? ", " + name : ""}!`);
      localStorage.removeItem("task_manager_welcome");
    }

    const fetchTasks = async () => {
      try {
        const data = await getTasks();
        setTasks(data);
      } catch (error) {
        console.error("Failed to load tasks", error);
      }
    };

    fetchTasks();
  }, [setTasks]);

  // Task Operations
  // Choose the appropriate task operation handlers depending on authentication.
  // `ops` provides a uniform API for the UI to call (add, delete, toggle, update).
  const ops = isAuthenticated
    ? TaskOperations(tasks, setTasks, setSelectedTask)
    : {
        handleAddTask: async () => {
          const newTask = { id: Date.now(), title: `Demo Task ${tasks.length + 1}`, description: "", completed: false } as any;
          setTasks([...tasks, newTask]);
        },
        handleDeleteTask: async (task: any) => {
          setTasks(tasks.filter((t) => t.id !== task.id));
        },
        handleToggleComplete: async (task: any) => {
          setTasks(tasks.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t)));
          setSelectedTask((prev: any) => (prev ? { ...prev, completed: !prev.completed } : prev));
        },
        handleUpdateDescription: async (task: any, newDescription: string) => {
          setTasks(tasks.map((t) => (t.id === task.id ? { ...t, description: newDescription } : t)));
          setSelectedTask((prev: any) => (prev ? { ...prev, description: newDescription } : prev));
        },
        handleUpdateTitle: async (task: any, newTitle: string) => {
          setTasks(tasks.map((t) => (t.id === task.id ? { ...t, title: newTitle } : t)));
          setSelectedTask((prev: any) => (prev ? { ...prev, title: newTitle } : prev));
        },
      };

  // Search & Notifications
  const { handleSearch } = useSearchNotifications(
    tasks,
    searchTerm,
    notifMessage,
    setNotifMessage,
    setFadeOut
  );

  // Modal & View Handling
  const handleCardClick = (task: any) => {
    setSelectedTask(task);
    setViewMode("card");
    setIsModalOpen(true);
  };

  const handleViewTask = (task: any) => {
    setSelectedTask(task);
    setViewMode("button");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
    setViewMode(null);
  };

  // Filtering Logic
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    if (tasks.length === 0) return false;
    switch (filter) {
      case "active": return task.completed && matchesSearch;
      case "inactive": return !task.completed && matchesSearch;
      case "all":
      default: return matchesSearch;
    }
  });

  return (
    <div className="home-container">
      <header className="home-header">
        <Link to="/" className="logo">TASK</Link>
        <div className="search-filter-group">
          <SearchBar
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            onSubmit={handleSearch}
          />
          <FilterTask currentFilter={filter} onFilterChange={setFilter} />
        </div>
        {isAuthenticated ? (
          <ProfileBtn />
        ) : (
          <button className="login-cta" onClick={() => navigate("/login")}>Login / Create Account</button>
        )}
      </header>

      {notifMessage && (
        <SearchNotif message={notifMessage} className={fadeOut ? "fade-out" : ""} />
      )}

      {/* Add button under header (right-aligned) - works in demo and authenticated modes */}
      <div className="add-task-top">
        <AddTaskButton onClick={ops.handleAddTask} />
      </div>

      <main className="home-main">
        {filteredTasks.length === 0 ? (
          filter === "active" ? (
            <div className="no-task"><h2>No Active Task</h2></div>
          ) : filter === "inactive" ? (
            <div className="no-task"><h2>No Inactive Task</h2></div>
          ) : (
            <div className="no-task">
              <h2>No task yet</h2>
              <div className="center-add">
                <AddTaskButton onClick={ops.handleAddTask} />
                <p className="add-hint">Create your first task to get started</p>
              </div>
            </div>
          )
        ) : filteredTasks.length === 1 ? (
          <div className="single-task">
            <TaskCard
              task={filteredTasks[0]}
              onCardClick={() => handleCardClick(filteredTasks[0])}
              onView={() => handleViewTask(filteredTasks[0])}
              onDelete={() => ops.handleDeleteTask(filteredTasks[0])}
            />
          </div>
        ) : (
          <div className="task-grid">
            {filteredTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onCardClick={() => handleCardClick(task)}
                onView={() => handleViewTask(task)}
                onDelete={() => ops.handleDeleteTask(task)}
              />
            ))}
          </div>
        )}
      </main>

      <TaskModal
        isOpen={isModalOpen}
        task={selectedTask}
        viewMode={viewMode}
        onClose={handleCloseModal}
        onToggleComplete={ops.handleToggleComplete}
        onUpdateDescription={ops.handleUpdateDescription}
        onUpdateTitle={ops.handleUpdateTitle}
      />
    </div>
  );
};

export default HomePage;
