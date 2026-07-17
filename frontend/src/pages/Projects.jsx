import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProjects } from "../services/projectApi";
import ProjectCard from "../components/ProjectCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";

const PROJECT_TYPES = ["Hackathon", "Open Source", "Startup", "College Project", "Personal Project", "AI/ML Project", "Web Project", "Mobile Project", "Research", "Other"];
const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Advanced"];
const COLLAB_MODES = ["Remote", "In person", "Hybrid"];
const SORT_OPTIONS = [
  { value: "match", label: "Best Match" },
  { value: "recent", label: "Most Recent" },
  { value: "slots", label: "Open Slots" },
];

const sortProjects = (projects, sort) => {
  const copy = [...projects];
  if (sort === "match") return copy.sort((a, b) => (b.projectMatch?.score ?? 0) - (a.projectMatch?.score ?? 0));
  if (sort === "recent") return copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (sort === "slots") return copy.sort((a, b) => (b.teamSize - (b.teamMembers?.length || 1)) - (a.teamSize - (a.teamMembers?.length || 1)));
  return copy;
};

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("match");
  const [filters, setFilters] = useState({ type: "", experienceLevel: "", collaborationMode: "" });
  const [showFilters, setShowFilters] = useState(false);
  const debounceRef = useRef(null);

  const loadProjects = useCallback(async (skill, activeFilters) => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      if (skill?.trim()) params.skill = skill.trim();
      if (activeFilters.type) params.type = activeFilters.type;
      const result = await getProjects(params);
      let data = result.data || [];
      // Client-side experience + collab mode filter (backend doesn't support yet)
      if (activeFilters.experienceLevel) data = data.filter((p) => p.experienceLevel === activeFilters.experienceLevel);
      if (activeFilters.collaborationMode) data = data.filter((p) => p.collaborationMode === activeFilters.collaborationMode);
      setProjects(data);
    } catch (err) {
      setError(err.message || "Unable to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadProjects(search, filters), 350);
    return () => clearTimeout(debounceRef.current);
  }, [search, filters, loadProjects]);

  const clearFilters = () => {
    setSearch("");
    setFilters({ type: "", experienceLevel: "", collaborationMode: "" });
  };

  const hasFilters = search || filters.type || filters.experienceLevel || filters.collaborationMode;
  const sorted = sortProjects(projects, sort);

  return (
    <div className="page-container">
      <div className="page-header page-header-actions">
        <div>
          <h1>Project Discovery</h1>
          <p className="page-subtitle">Find your next collaboration. {projects.length > 0 && `${projects.length} open project${projects.length !== 1 ? "s" : ""} found.`}</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/projects/create")}>Create project</button>
      </div>

      {error && <ErrorMessage message={error} onRetry={() => loadProjects(search, filters)} />}

      <div className="project-discovery-controls">
        <div className="project-search-row">
          <input
            className="project-search-input"
            placeholder="Search by required skill…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className={`btn btn-ghost filter-toggle${showFilters ? " active" : ""}`}
            onClick={() => setShowFilters((v) => !v)}
          >
            Filters {hasFilters && <span className="filter-dot" />}
          </button>
          <div className="sort-row">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`sort-chip${sort === opt.value ? " active" : ""}`}
                onClick={() => setSort(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {showFilters && (
          <div className="project-advanced-filters">
            <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
              <option value="">All project types</option>
              {PROJECT_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <select value={filters.experienceLevel} onChange={(e) => setFilters({ ...filters, experienceLevel: e.target.value })}>
              <option value="">Any experience level</option>
              {EXPERIENCE_LEVELS.map((l) => <option key={l}>{l}</option>)}
            </select>
            <select value={filters.collaborationMode} onChange={(e) => setFilters({ ...filters, collaborationMode: e.target.value })}>
              <option value="">Any collaboration mode</option>
              {COLLAB_MODES.map((m) => <option key={m}>{m}</option>)}
            </select>
            {hasFilters && (
              <button className="btn btn-ghost" onClick={clearFilters}>Clear all</button>
            )}
          </div>
        )}
      </div>

      {loading
        ? <LoadingSpinner />
        : !sorted.length
          ? (
            <EmptyState
              title={hasFilters ? "No projects match your filters" : "No open projects yet"}
              message={hasFilters ? "Try adjusting your search or filters." : "Create the first collaboration opportunity for your network."}
              action={hasFilters ? { label: "Clear filters", onClick: clearFilters } : { label: "Create a project", onClick: () => navigate("/projects/create") }}
            />
          )
          : <div className="projects-grid">{sorted.map((p) => <ProjectCard key={p._id} project={p} />)}</div>
      }
    </div>
  );
}
