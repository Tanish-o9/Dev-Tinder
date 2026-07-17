import { Link } from "react-router-dom";

const COLLAB_ICONS = {
  "Remote": (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  "In person": (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  ),
  "Hybrid": (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  ),
};

export default function ProjectCard({ project }) {
  const openRoles = (project.openRoles || []).filter((r) => !r.filled);
  const slotsLeft = project.teamSize - (project.teamMembers?.length || 1);
  const hasMatch = typeof project.projectMatch?.score === "number";

  return (
    <Link className="project-card" to={`/projects/${project._id}`}>
      <div className="project-card-top">
        <span className="experience-badge">{project.projectType}</span>
        <span className="project-status">{project.status}</span>
        {hasMatch && project.projectMatch.score > 0 && (
          <span className="project-match-badge">{project.projectMatch.score}% match</span>
        )}
      </div>

      <h2>{project.title}</h2>
      <p className="project-card-summary">{project.summary}</p>

      <div className="project-card-meta">
        <span className="project-meta-item">
          {COLLAB_ICONS[project.collaborationMode]}
          {project.collaborationMode}
        </span>
        <span className="project-meta-item">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          {project.teamMembers?.length || 1}/{project.teamSize}
          {slotsLeft > 0 && <span className="slots-left"> · {slotsLeft} open</span>}
        </span>
        <span className="experience-badge experience-badge--sm">{project.experienceLevel}</span>
      </div>

      {project.projectMatch?.matchingSkills?.length > 0 && (
        <div className="project-card-skills">
          <span className="project-skills-label">Your skills</span>
          <div className="user-card-interests">
            {project.projectMatch.matchingSkills.slice(0, 4).map((s) => (
              <span key={s} className="interest-tag skill-match">{s}</span>
            ))}
          </div>
        </div>
      )}

      {openRoles.length > 0 && (
        <div className="project-card-roles">
          <span className="project-skills-label">Open roles</span>
          <div className="user-card-interests">
            {openRoles.slice(0, 3).map((r, i) => (
              <span key={i} className="interest-tag interest-tag--role">{r.role}</span>
            ))}
            {openRoles.length > 3 && <span className="interest-tag">+{openRoles.length - 3}</span>}
          </div>
        </div>
      )}

      <div className="user-card-interests project-card-required">
        {project.requiredSkills.slice(0, 5).map((s) => (
          <span key={s} className="interest-tag">{s}</span>
        ))}
        {project.requiredSkills.length > 5 && (
          <span className="interest-tag">+{project.requiredSkills.length - 5}</span>
        )}
      </div>

      <small className="project-card-footer">
        by {project.ownerId?.firstName || "you"}
      </small>
    </Link>
  );
}
