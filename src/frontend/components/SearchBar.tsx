import type { FormEvent } from "react";

interface SearchBarProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchTermChange, onSubmit }) => {
  return (
    <form className="search-bar" onSubmit={onSubmit}>
      <input
        type="text"
        placeholder="Search Task"
        value={searchTerm}
        onChange={(e) => onSearchTermChange(e.target.value)}
      />
    </form>
  );
};

export default SearchBar;
