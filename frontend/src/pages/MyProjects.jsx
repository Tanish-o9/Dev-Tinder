import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyProjects } from "../services/projectApi";
import ProjectCard from "../components/ProjectCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import ErrorMessage from "../components/ErrorMessage";

const STATUS_ORDER = ["Open", "Team Formed", "In Progress", "Completed", "Closed"];

export default function MyProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setProjects((await getMyProjects()).data || []);
    } catch (err) {
      setError(err.message || "Unable to load your projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner fullPage />;

  const statusCounts = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = projects.filter((p) => p.status === s).length;
    return acc;
  }, {});

  const filtered = statusFilter === "all" ? projects : projects.filter((p) => p.status === statusFilter);

  return (
    <div className="page-container">
      <div className="page-header page-header-actions">
        <div>
          <h1>My projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? "s" : ""} created</p>
        </div>
        <Link className="btn btn-primary" to="/projects/create">Create project</Link>
      </div>

      {error && <ErrorMessage message={error} onRetry={load} />}

      {projects.length > 0 && (
        <div className="my-projects-status-bar">
          <button
            className={`status-filter-chip${statusFilter === "all" ? " active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            All <span className="status-count">{projects.length}</span>
          </button>
          {STATUS_ORDER.filter((s) => statusCounts[s] > 0).map((s) => (
            <button
              key={s}
              className={`status-filter-chip${statusFilter === s ? " active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s} <span className="status-count">{statusCounts[s]}</span>
            </button>
          ))}
        </div>
      )}

      {!projects.length
        ? <EmptyState title="No projects yet" message="Create a project to find your teammates." action={{ label: "Create project", onClick: () => navigate("/projects/create") }} />
        : !filtered.length
          ? <EmptyState title={`No ${statusFilter} projects`} message="Try a different status filter." action={{ label: "Show all", onClick: () => setStatusFilter("all") }} />
          : <div className="projects-grid">{filtered.map((p) => <ProjectCard key={p._id} project={p} />)}</div>
      }
    </div>
  );
}
