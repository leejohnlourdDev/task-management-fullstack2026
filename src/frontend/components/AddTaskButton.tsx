import React from "react";

interface AddTaskButtonProps {
    onClick?: () => void;
}

// Simple AddTaskButton: reusable small button used in multiple places
// The parent provides the `onClick` handler which may call demo-local
// logic or the API depending on auth state.
const AddTaskButton: React.FC<AddTaskButtonProps> = ({onClick}) => {
    return (
        <button className="btn-add-task" onClick={onClick}>
            Add Task
        </button>
    );
};

export default AddTaskButton;