import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProject, getProjectTeam, updateProject } from "../services/projectApi";
import { useAuth } from "../hooks/useAuth";
import TeamMemberCard from "../components/TeamMemberCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

const statuses = ["Open", "Team Formed", "In Progress", "Completed", "Closed"];

const norm = (s) => String(s || "").trim().toLowerCase();

function TeamComposition({ project, team }) {
  const requiredSkills = project.requiredSkills || [];
  if (!requiredSkills.length) return null;

  // Aggregate all team skills
  const teamSkillSet = new Set(team.flatMap((m) => (m.skills || []).map(norm)));

  const covered = requiredSkills.filter((s) => teamSkillSet.has(norm(s)));
  const missing = requiredSkills.filter((s) => !teamSkillSet.has(norm(s)));
  const coveragePct = requiredSkills.length ? Math.round((covered.length / requiredSkills.length) * 100) : 0;

  const openRoles = (project.openRoles || []).filter((r) => !r.filled);

  return (
    <section className="team-composition">
      <h2>Team composition</h2>

      <div className="composition-coverage">
        <div className="coverage-header">
          <span>Skill coverage</span>
          <strong style={{ color: coveragePct >= 70 ? "var(--accent)" : coveragePct >= 40 ? "var(--warning, #f59e0b)" : "var(--error, #ef4444)" }}>
            {coveragePct}%
          </strong>
        </div>
        <div className="coverage-bar-track">
          <div
            className="coverage-bar-fill"
            style={{
              width: `${coveragePct}%`,
              background: coveragePct >= 70 ? "var(--accent)" : coveragePct >= 40 ? "var(--warning, #f59e0b)" : "var(--error, #ef4444)",
            }}
          />
        </div>
        <p className="coverage-detail">{covered.length} of {requiredSkills.length} required skills covered by the team</p>
      </div>

      {covered.length > 0 && (
        <div className="composition-section">
          <span className="composition-label covered">Covered skills</span>
          <div className="user-card-interests">
            {covered.map((s) => <span key={s} className="interest-tag skill-match">{s}</span>)}
          </div>
        </div>
      )}

      {missing.length > 0 && (
        <div className="composition-section">
          <span className="composition-label missing">Missing skills</span>
          <div className="user-card-interests">
            {missing.map((s) => <span key={s} className="interest-tag skill-missing">{s}</span>)}
          </div>
          {project.status === "Open" && (
            <p className="composition-hint">These skills are still needed. Consider recruiting developers with these skills.</p>
          )}
        </div>
      )}

      {openRoles.length > 0 && (
        <div className="composition-section">
          <span className="composition-label open-roles">Open roles ({openRoles.length})</span>
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
        </div>
      )}
    </section>
  );
}

export default function TeamDashboard() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [team, setTeam] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      const [projectData, teamData] = await Promise.all([getProject(projectId), getProjectTeam(projectId)]);
      setProject(projectData.data);
      setTeam(teamData.data || []);
    } catch (err) {
      setError(err.message || "Unable to load team");
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (event) => {
    const status = event.target.value;
    try {
      setSaving(true);
      const result = await updateProject(projectId, { status });
      setProject((p) => ({ ...p, ...result.data }));
      setNotice("Project status updated.");
    } catch (err) {
      setError(err.message || "Could not update project status");
    } finally {
      setSaving(false);
    }
  };

  if (error && !project) return <div className="page-container"><ErrorMessage message={error} onRetry={load} /></div>;
  if (!project) return <LoadingSpinner fullPage />;

  const isOwner = project.ownerId?._id === user?._id;
  const slotsLeft = project.teamSize - team.length;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{project.title}</h1>
        <p className="page-subtitle">
          {team.length} of {project.teamSize} members · {slotsLeft > 0 ? `${slotsLeft} slot${slotsLeft !== 1 ? "s" : ""} open` : "Team full"}
        </p>
      </div>

      {error && <ErrorMessage message={error} />}
      {notice && <p className="success-message">{notice}</p>}

      <section className="project-detail">
        <div className="project-card-top">
          <span className="experience-badge">{project.projectType}</span>
          <span className="project-status">{project.status}</span>
        </div>
        <p>{project.summary}</p>
        <p><strong>Collaboration:</strong> {project.collaborationMode}{project.location ? ` · ${project.location}` : ""}</p>
        <p><strong>Experience level:</strong> {project.experienceLevel}</p>

        {project.requiredSkills?.length > 0 && (
          <>
            <h3>Required skills</h3>
            <div className="user-card-interests">
              {project.requiredSkills.map((skill) => <span className="interest-tag" key={skill}>{skill}</span>)}
            </div>
          </>
        )}

        {isOwner && (
          <div className="owner-controls">
            <h3>Owner controls</h3>
            <div className="owner-controls-actions">
              <Link className="btn btn-outline" to={`/projects/${projectId}/applications`}>Review applications</Link>
              <Link className="btn btn-outline" to={`/projects/${projectId}/edit`}>Edit project</Link>
            </div>
            <label className="status-label">
              Project status
              <select value={project.status} disabled={saving} onChange={changeStatus}>
                {statuses.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
          </div>
        )}
      </section>

      <TeamComposition project={project} team={team} />

      <section>
        <h2>Team members</h2>
        <div className="team-dashboard">
          {team.map((member) => (
            <TeamMemberCard key={member._id} member={member} ownerId={project.ownerId?._id} />
          ))}
        </div>
      </section>
    </div>
  );
}
