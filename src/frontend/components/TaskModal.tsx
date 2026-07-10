import React, { useState, useEffect } from "react";
import "../styles/TaskModal.css";

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

interface TaskModalProps {
  isOpen: boolean;
  task: Task | null;
  viewMode: "card" | "button" | null;
  onClose: () => void;
  onToggleComplete: (task: Task) => void;
  onUpdateDescription: (task: Task, newDescription: string) => void;
  onUpdateTitle: (task: Task, newTitle: string) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  task,
  viewMode,
  onClose,
  onToggleComplete,
  onUpdateDescription,
  onUpdateTitle,
}) => {
  if (!isOpen || !task) return null;

  const [draftDesc, setDraftDesc] = useState(task.description);
  const [draftTitle, setDraftTitle] = useState(task.title);
  const [isEditingTitle, setIsEditingTitle] = useState(true);
  const [isEditingDesc, setIsEditingDesc] = useState(true);

  useEffect(() => {
    if (task) {
      setDraftDesc(task.description);
      setDraftTitle(task.title);
      setIsEditingTitle(true);
      setIsEditingDesc(true);
    }
  }, [task]);

  const handleDescKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const trimmed = draftDesc.trim();
      if (trimmed) {
        onUpdateDescription(task, trimmed);
        setDraftDesc(trimmed);
        setIsEditingDesc(false); // switch to read-only
      }
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = draftTitle.trim();
      if (trimmed) {
        onUpdateTitle(task, trimmed);
        setDraftTitle(trimmed);
        setIsEditingTitle(false); // switch to read-only
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        {/* Title */}
        {viewMode === "card" ? (
          isEditingTitle ? (
            <input
              type="text"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onKeyDown={handleTitleKeyDown}
              className="title-input"
              placeholder="Enter task title..."
            />
          ) : (
            <h2 onClick={() => setIsEditingTitle(true)}>{draftTitle}</h2>
          )
        ) : (
          <h2>{task.title}</h2>
        )}

        {/* Description */}
        {viewMode === "card" ? (
          isEditingDesc ? (
            <textarea
              value={draftDesc}
              onChange={(e) => setDraftDesc(e.target.value)}
              onKeyDown={handleDescKeyDown}
              className="description-input"
              placeholder="Write a description..."
            />
          ) : (
            <p onClick={() => setIsEditingDesc(true)}>
              {draftDesc || "No description yet"}
            </p>
          )
        ) : (
          <p className="description-read">
            {task.description || "No description yet"}
          </p>
        )}

        <div className="modal-actions">
          <button
            className={task.completed ? "btn-incomplete" : "btn-complete"}
            onClick={() => onToggleComplete(task)}
          >
            {task.completed ? "Incomplete" : "Complete"}
          </button>
          <button className="btn-close" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
