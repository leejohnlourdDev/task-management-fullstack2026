import { useState } from "react";
import type { Task } from "../../types/task";

export const useStateManagement = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"card" | "button" | null>(null);
  const [notifMessage, setNotifMessage] = useState("");
  const [fadeOut, setFadeOut] = useState(false);

  return {
    tasks, setTasks,
    searchTerm, setSearchTerm,
    filter, setFilter,
    selectedTask, setSelectedTask,
    isModalOpen, setIsModalOpen,
    viewMode, setViewMode,
    notifMessage, setNotifMessage,
    fadeOut, setFadeOut
  };
};
