
import { ArrowDownUp, ChevronDown, ListFilter, Search, X } from "lucide-react";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  filter: string;
  onFilterChange: (value: string) => void;
  filterOptions: string[];
  onSort: () => void;
  sortLabel: string;
};

export function ProjectToolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  filterOptions,
  onSort,
  sortLabel,
}: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <label className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-white/[0.08] bg-surface px-3.5 transition focus-within:border-accent/50">
        <Search size={17} className="shrink-0 text-muted" />

        <input
          id="project-search"
          type="search"
          placeholder="Search repositories, languages, topics..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="h-11 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-muted/70"
        />

        {search && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onSearchChange("")}
            className="text-muted hover:text-white"
          >
            <X size={15} />
          </button>
        )}
      </label>

      <label className="relative flex h-11 items-center gap-2 rounded-xl border border-white/[0.08] bg-surface px-3.5 text-muted">
        <ListFilter size={16} />

        <select
          aria-label="Filter by programming language"
          value={filter}
          onChange={(event) => onFilterChange(event.target.value)}
          className="max-w-48 appearance-none bg-transparent pr-5 text-sm text-slate-200 outline-none"
        >
          {filterOptions.map((option) => (
            <option key={option} value={option} className="bg-surface">
              {option}
            </option>
          ))}
        </select>

        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-3"
        />
      </label>

      <button
        type="button"
        onClick={onSort}
        className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-surface px-4 text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
      >
        <ArrowDownUp size={16} />
        {sortLabel}
      </button>
    </div>
  );
}
