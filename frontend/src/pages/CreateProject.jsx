import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProject } from "../services/projectApi";
import ErrorMessage from "../components/ErrorMessage";

const TYPES = ["Hackathon", "Open Source", "Startup", "College Project", "Personal Project", "AI/ML Project", "Web Project", "Mobile Project", "Research", "Other"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const MODES = ["Remote", "In person", "Hybrid"];

export default function CreateProject() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", summary: "", description: "", requiredSkills: "",
    projectType: "Hackathon", experienceLevel: "Beginner", collaborationMode: "Remote",
    location: "", teamSize: 4,
  });
  const [openRoles, setOpenRoles] = useState([]);
  const [roleInput, setRoleInput] = useState({ role: "", skills: "" });

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addRole = () => {
    if (!roleInput.role.trim() || openRoles.length >= 10) return;
    setOpenRoles([...openRoles, {
      role: roleInput.role.trim(),
      skills: roleInput.skills.split(",").map((s) => s.trim()).filter(Boolean),
    }]);
    setRoleInput({ role: "", skills: "" });
  };

  const removeRole = (i) => setOpenRoles(openRoles.filter((_, idx) => idx !== i));

  const submit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const result = await createProject({
        ...form,
        requiredSkills: form.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean),
        openRoles,
      });
      navigate(`/projects/${result.data._id}`);
    } catch (err) {
      setError(err.message || "Could not create project");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Create a project</h1>
        <p className="page-subtitle">Describe the collaboration and the teammates you need.</p>
      </div>
      {error && <ErrorMessage message={error} />}
      <form className="project-form" onSubmit={submit}>
        <input required name="title" placeholder="Project title" value={form.title} onChange={change} />
        <input required name="summary" maxLength="300" placeholder="Short description (max 300 chars)" value={form.summary} onChange={change} />
        <textarea required name="description" placeholder="Full project description" value={form.description} onChange={change} />
        <input name="requiredSkills" placeholder="Required skills, comma separated" value={form.requiredSkills} onChange={change} />

        <div className="form-row">
          <select name="projectType" value={form.projectType} onChange={change}>
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <select name="experienceLevel" value={form.experienceLevel} onChange={change}>
            {LEVELS.map((l) => <option key={l}>{l}</option>)}
          </select>
          <select name="collaborationMode" value={form.collaborationMode} onChange={change}>
            {MODES.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>

        <input name="location" placeholder="Location (optional)" value={form.location} onChange={change} />
        <input required name="teamSize" type="number" min="2" max="20" value={form.teamSize} onChange={change} />

        <div className="open-roles-editor">
          <h3>Open roles <span className="optional-label">(optional)</span></h3>
          <p className="form-hint">Define specific roles you are looking for. Applicants can apply for a specific role.</p>
          {openRoles.map((r, i) => (
            <div key={i} className="open-role-row">
              <strong>{r.role}</strong>
              {r.skills.length > 0 && <span className="role-skills-preview">{r.skills.join(", ")}</span>}
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeRole(i)}>Remove</button>
            </div>
          ))}
          {openRoles.length < 10 && (
            <div className="open-role-inputs">
              <input
                placeholder="Role title (e.g. Frontend Developer)"
                value={roleInput.role}
                onChange={(e) => setRoleInput({ ...roleInput, role: e.target.value })}
              />
              <input
                placeholder="Skills for this role, comma separated"
                value={roleInput.skills}
                onChange={(e) => setRoleInput({ ...roleInput, skills: e.target.value })}
              />
              <button type="button" className="btn btn-outline btn-sm" onClick={addRole} disabled={!roleInput.role.trim()}>
                Add role
              </button>
            </div>
          )}
        </div>

        <button className="btn btn-primary" disabled={saving}>{saving ? "Creating…" : "Create project"}</button>
      </form>
    </div>
  );
}
