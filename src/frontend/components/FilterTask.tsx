import React from "react";
import "../styles/FilterTask.css"; // separate CSS

interface FilterTaskProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

const FilterTask: React.FC<FilterTaskProps> = ({ currentFilter, onFilterChange }) => {
  return (
    <div className="filter-task">
      <select
        value={currentFilter}
        onChange={(e) => onFilterChange(e.target.value)}
        className="filter-select"
      >
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>
  );
};

export default FilterTask;
