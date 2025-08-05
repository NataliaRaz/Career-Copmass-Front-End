
type FilterProps = {
  skillFilter: string;
  educationFilter: string;
  sortOption: string;
  onSkillChange: (value: string) => void;
  onEducationChange: (value: string) => void;
  onSortChange: (value: string) => void;
};

export default function FilterBar({
  skillFilter,
  educationFilter,
  sortOption,
  onSkillChange,
  onEducationChange,
  onSortChange,
}: FilterProps) {
  return (
    <div className="filter-bar">
      <input
        type="text"
        placeholder="Search by skill..."
        value={skillFilter}
        onChange={(e) => onSkillChange(e.target.value)}
      />

      <select value={educationFilter} onChange={(e) => onEducationChange(e.target.value)}>
        <option value="">All Education Levels</option>
        <option value="High School">High School</option>
        <option value="Bachelor">Bachelor</option>
        <option value="Master">Master</option>
        <option value="PhD">PhD</option>
      </select>

      <select value={sortOption} onChange={(e) => onSortChange(e.target.value)}>
        <option value="">Sort By</option>
        <option value="alphabetical">A-Z</option>
        <option value="salary">Salary</option>
        <option value="popularity">Popularity</option>
      </select>
    </div>
  );
}