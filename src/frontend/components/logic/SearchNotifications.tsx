import { useEffect } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { Task } from "../../types/task";

export const useSearchNotifications = (
  tasks: Task[],
  searchTerm: string,
  notifMessage: string,
  setNotifMessage: Dispatch<SetStateAction<string>>,
  setFadeOut: Dispatch<SetStateAction<boolean>>
) => {
  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) {
      setNotifMessage("Invalid Search");
      return;
    }

    const matches = tasks.filter((task) =>
      task.title.toLowerCase().includes(normalized)
    );

    if (matches.length === 0) {
      setNotifMessage("Invalid Search");
      return;
    }

    if (matches.some((task) => !task.completed)) {
      setNotifMessage("Incomplete Task!");
    } else {
      setNotifMessage("Task Completed");
    }
  };

  useEffect(() => {
    if (notifMessage) {
      setFadeOut(false);
      const timer = setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => setNotifMessage(""), 500);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [notifMessage, setFadeOut, setNotifMessage]);

  return { handleSearch };
};
