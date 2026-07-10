import { createTask, updateTask, deleteTask } from "../../api/taskApi";
import type { Task } from "../../types/task";

// TaskOperations: thin wrapper around API calls that returns handlers
// for add/delete/update/toggle so the UI code can call them without
// worrying about the API details. Handlers update local state after
// successful API responses.
export const TaskOperations = (tasks: Task[], setTasks: Function, setSelectedTask: Function) => {
  const handleAddTask = async () => {
    try {
      const newTask = await createTask({
        title: `Task ${tasks.length + 1}`,
        description: "",
        completed: false,
      });
      setTasks([...tasks, newTask]);
    } catch (error) {
      console.error("Failed to add task", error);
    }
  };

  const handleDeleteTask = async (task: Task) => {
    try {
      await deleteTask(task.id);
      setTasks(tasks.filter((t) => t.id !== task.id));
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      const updatedTask = await updateTask(task.id, { completed: !task.completed });
      setTasks(tasks.map((t) => (t.id === task.id ? updatedTask : t)));
      setSelectedTask((prev: Task | null) =>
        prev ? { ...prev, completed: updatedTask.completed } : prev
      );
    } catch (error) {
      console.error("Failed to toggle task completion", error);
    }
  };

  const handleUpdateDescription = async (task: Task, newDescription: string) => {
    try {
      const updatedTask = await updateTask(task.id, { description: newDescription });
      setTasks(tasks.map((t) => (t.id === task.id ? updatedTask : t)));
      setSelectedTask((prev: Task | null) =>
        prev ? { ...prev, description: updatedTask.description } : prev
      );
    } catch (error) {
      console.error("Failed to update task description", error);
    }
  };

  const handleUpdateTitle = async (task: Task, newTitle: string) => {
    try {
      const updatedTask = await updateTask(task.id, { title: newTitle });
      setTasks(tasks.map((t) => (t.id === task.id ? updatedTask : t)));
      setSelectedTask((prev: Task | null) =>
        prev ? { ...prev, title: updatedTask.title } : prev
      );
    } catch (error) {
      console.error("Failed to update task title", error);
    }
  };

  return { handleAddTask, handleDeleteTask, handleToggleComplete, handleUpdateDescription, handleUpdateTitle };
};
