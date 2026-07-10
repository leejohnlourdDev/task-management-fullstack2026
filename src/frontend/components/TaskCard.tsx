import React from "react";
import "../styles/TaskCard.css";

// Define the structure of a task object
interface Task {
  title: string;
  description: string;
  completed: boolean;
}

// Define the props that Task Card expects
interface TaskCardProps {
  task: Task; // Task data to display
  onCardClick: () => void; // Function when the card itself clicked (edit-mode)
  onView: () => void; // Function when "View" button is clicked (read-only mode)
  onDelete: () => void; // Function when "Delete" button is clicked
}

// Task Card Component
const TaskCard: React.FC<TaskCardProps> = ({ task, onCardClick, onView, onDelete }) => {
  return (
    <div
      className={`task-card ${task.completed ? "completed" : ""}`}
      onClick={onCardClick}
    >
      {/* Display task title */}
      <span>{task.title}</span>

      {/* Action button (shown on hover) */}
      <div className="task-actions">
        {/* View button: stopPropagation prevent triggering card click */}
        <button className="btn-view" onClick={(e) => { e.stopPropagation(); onView(); }}>
          View
        </button>
        {/* Delete button: stopPropagation prevents triggering card click */}
        <button className="btn-delete" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
