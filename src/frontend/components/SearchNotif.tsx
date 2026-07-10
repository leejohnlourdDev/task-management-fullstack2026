import React from "react";
import "../styles/SearchNotif.css";

interface SearchNotifProps {
  message: string;
  className?: string;
}

const SearchNotif: React.FC<SearchNotifProps> = ({ message, className }) => {
  if (!message) return null;

  // Normalize message to valid CSS class
  const normalized = message
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // remove punctuation like !
    .replace(/\s+/g, "-");        // replace spaces with -

  const baseClass = `search-notif ${normalized}`;
  return <div className={`${baseClass} ${className || ""}`}>{message}</div>;
};

export default SearchNotif;
