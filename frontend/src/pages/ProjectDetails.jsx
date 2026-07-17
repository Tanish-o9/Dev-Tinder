import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { applyToProject, getProject } from "../services/projectApi";
import { useAuth } from "../hooks/useAuth";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import TeamMemberCard from "../components/TeamMemberCard";

export default function ProjectDetails() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [message, setMessage] = useState("");
  const [roleAppliedFor, setRoleAppliedFor] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [applying, setApplying] = useState(false);

  const load = useCallback(async () => {
    try {
      setError("");
      setProject((await getProject(projectId)).data);
    } catch (err) {
      setError(err.message || "Unable to load project");
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const apply = async (event) => {
    event.preventDefault();
    try {
      setApplying(true);
      await applyToProject(projectId, message, roleAppliedFor);
      setNotice("Application submitted. The project owner has been notified.");
      setProject({ ...project, viewerApplicationStatus: "pending" });
    } catch (err) {
      setError(err.message || "Could not submit application");
    } finally {
      setApplying(false);
    }
  };

  if (error && !project) return <div className="page-container"><ErrorMessage message={error} onRetry={load} /></div>;
  if (!project) return <LoadingSpinner fullPage />;

  const isOwner = project.ownerId?._id === user?._id;
  const isMember = project.teamMembers?.some((m) => m._id === user?._id);
  const canApply = !isOwner && !isMember && !project.viewerApplicationStatus && project.status === "Open" && !project.isFull;
  const openRoles = (project.openRoles || []).filter((r) => !r.filled);

  return (
    <div className="page-container">
      <div className="project-detail">
        <div className="project-card-top">
          <span className="experience-badge">{project.projectType}</span>
          <span className="project-status">{project.status}</span>
          {typeof project.projectMatch?.score === "number" && (
            <span className="project-match-badge">{project.projectMatch.score}% match</span>
          )}
        </div>

        <h1>{project.title}</h1>
        <p className="page-subtitle">{project.summary}</p>
        <p>{project.description}</p>
        <p><strong>Owner:</strong> {project.ownerId?.firstName} {project.ownerId?.lastName}</p>
        <p><strong>{project.collaborationMode}</strong>{project.location ? ` · ${project.location}` : ""} · <strong>{project.experienceLevel}</strong> · Team {project.teamMembers?.length}/{project.teamSize}</p>

        {project.projectMatch?.matchingSkills?.length > 0 && (
          <section className="project-matching-skills">
            <h3>Your matching skills</h3>
            <div className="user-card-interests">
              {project.projectMatch.matchingSkills.map((s) => <span className="interest-tag skill-match" key={s}>{s}</span>)}
            </div>
          </section>
        )}

        {project.projectMatch?.relatedSkills?.length > 0 && (
          <section className="project-matching-skills">
            <h3>Related skills you have</h3>
            <div className="user-card-interests">
              {project.projectMatch.relatedSkills.map((s) => <span className="interest-tag skill-related" key={s}>{s}</span>)}
            </div>
          </section>
        )}

        <h3>Required skills</h3>
        <div className="user-card-interests">
          {project.requiredSkills.map((s) => <span className="interest-tag" key={s}>{s}</span>)}
        </div>

        {openRoles.length > 0 && (
          <section className="open-roles-section">
            <h3>Open roles ({openRoles.length})</h3>
            <div className="open-roles-list">
              {openRoles.map((r, i) => (
                <div key={i} className="open-role-item">
                  <strong>{r.role}</strong>
                  {r.skills?.length > 0 && (
                    <div className="user-card-interests">
                      {r.skills.map((s) => <span key={s} className="interest-tag">{s}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <h3>Team</h3>
        <div className="team-dashboard">
          {project.teamMembers?.map((m) => <TeamMemberCard key={m._id} member={m} ownerId={project.ownerId?._id} />)}
        </div>

        {isOwner && (
          <p className="owner-links">
            <Link className="btn btn-outline" to={`/projects/${projectId}/applications`}>Review applications</Link>
            {" "}
            <Link className="btn btn-outline" to={`/projects/${projectId}/team`}>Team dashboard</Link>
          </p>
        )}
      </div>

      {notice && <p className="success-message">{notice}</p>}
      {error && <ErrorMessage message={error} />}

      {canApply && (
        <form className="project-form" onSubmit={apply}>
          <h2>Apply to collaborate</h2>
          {openRoles.length > 0 && (
            <label>
              Role you are applying for
              <select value={roleAppliedFor} onChange={(e) => setRoleAppliedFor(e.target.value)}>
                <option value="">General application</option>
                {openRoles.map((r) => <option key={r.role} value={r.role}>{r.role}</option>)}
              </select>
            </label>
          )}
          <textarea
            maxLength="1500"
            placeholder="Tell the owner why you are a great fit"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button className="btn btn-primary" disabled={applying}>{applying ? "Submitting…" : "Send application"}</button>
        </form>
      )}

      {project.viewerApplicationStatus && <p className="success-message">Your application is {project.viewerApplicationStatus}.</p>}
      {project.isFull && !isMember && <p className="page-subtitle">This project team is full.</p>}
    </div>
  );
}
