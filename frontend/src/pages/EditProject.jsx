import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProject, updateProject } from "../services/projectApi";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

export default function EditProject() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [openRoles, setOpenRoles] = useState([]);
  const [roleInput, setRoleInput] = useState({ role: "", skills: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProject(projectId)
      .then(({ data }) => {
        setForm({ ...data, requiredSkills: data.requiredSkills.join(", ") });
        setOpenRoles(data.openRoles || []);
      })
      .catch((err) => setError(err.message || "Unable to load project"));
  }, [projectId]);

  const addRole = () => {
    if (!roleInput.role.trim() || openRoles.length >= 10) return;
    setOpenRoles([...openRoles, {
      role: roleInput.role.trim(),
      skills: roleInput.skills.split(",").map((s) => s.trim()).filter(Boolean),
      filled: false,
    }]);
    setRoleInput({ role: "", skills: "" });
  };

  const removeRole = (i) => setOpenRoles(openRoles.filter((_, idx) => idx !== i));

  const submit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateProject(projectId, {
        ...form,
        requiredSkills: form.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean),
        openRoles,
      });
      navigate(`/projects/${projectId}/team`);
    } catch (err) {
      setError(err.message || "Could not update project");
    } finally {
      setSaving(false);
    }
  };

  if (error && !form) return <div className="page-container"><ErrorMessage message={error} /></div>;
  if (!form) return <LoadingSpinner fullPage />;

  return (
    <div className="page-container">
      <div className="page-header"><h1>Update project</h1></div>
      {error && <ErrorMessage message={error} />}
      <form className="project-form" onSubmit={submit}>
        <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Project title" />
        <input required value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="Short description" />
        <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Full description" />
        <input value={form.requiredSkills} onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })} placeholder="Required skills, comma separated" />
        <input required type="number" min="2" max="20" value={form.teamSize} onChange={(e) => setForm({ ...form, teamSize: e.target.value })} />

        <div className="open-roles-editor">
          <h3>Open roles <span className="optional-label">(optional)</span></h3>
          {openRoles.map((r, i) => (
            <div key={i} className="open-role-row">
              <strong>{r.role}</strong>
              {r.filled && <span className="role-filled-badge">Filled</span>}
              {r.skills?.length > 0 && <span className="role-skills-preview">{r.skills.join(", ")}</span>}
              {!r.filled && <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeRole(i)}>Remove</button>}
            </div>
          ))}
          {openRoles.length < 10 && (
            <div className="open-role-inputs">
              <input
                placeholder="Role title"
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

        <button className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save project"}</button>
      </form>
    </div>
  );
}
