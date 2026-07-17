import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { updateProfile } from "../services/userApi";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import GithubProfile from "../components/GithubProfile";
import TechStackEditor from "../components/TechStackEditor";

const LINK_LABELS = { linkedin: "LinkedIn", github: "GitHub", leetcode: "LeetCode", gfg: "GeeksforGeeks", codechef: "CodeChef", codeforces: "Codeforces", hackerrank: "HackerRank" };
const emptyLinks = () => Object.fromEntries(Object.keys(LINK_LABELS).map((k) => [k, ""]));
const INTERESTS = ["Hackathons", "Open Source", "Startup", "College Projects", "AI Projects", "Web Development", "Mobile Development", "Research"];
const ROLES = ["Frontend Developer", "Backend Developer", "Full Stack Developer", "Mobile Developer", "AI/ML Engineer", "Data Scientist", "DevOps Engineer", "Cloud Engineer", "Cybersecurity Engineer", "UI/UX Developer", "Blockchain Developer", "Other"];

const userToForm = (profile) => ({
  firstName: profile.firstName || "",
  lastName: profile.lastName || "",
  photoURL: profile.photoURL || "",
  age: profile.age || "",
  gender: profile.gender || "",
  about: profile.about || "",
  educationType: profile.educationType || "",
  institutionName: profile.institutionName || "",
  socialLinks: { ...emptyLinks(), ...(profile.socialLinks || {}) },
  developerRole: profile.developerRole || "",
  experienceLevel: profile.experienceLevel || "",
  collaborationInterests: profile.collaborationInterests || [],
  githubUsername: profile.githubUsername || "",
  skills: profile.skills || [],
  location: profile.location || "",
  availability: profile.availability || "",
});

function ReadinessBar({ readiness }) {
  if (!readiness) return null;
  const color = readiness.score >= 80 ? "var(--success)" : readiness.score >= 50 ? "var(--accent)" : "var(--warning)";
  return (
    <div className="readiness-card">
      <div className="readiness-header">
        <span className="readiness-title">Collaboration Readiness</span>
        <span className="readiness-score" style={{ color }}>{readiness.score}%</span>
      </div>
      <div className="readiness-bar-track">
        <div className="readiness-bar-fill" style={{ width: `${readiness.score}%`, background: color }} />
      </div>
      <p className="readiness-label">{readiness.label}</p>
      {readiness.missing?.length > 0 && (
        <ul className="readiness-missing">
          {readiness.missing.map((hint) => <li key={hint}>{hint}</li>)}
        </ul>
      )}
    </div>
  );
}

export default function Profile() {
  const { user, loading: authLoading, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imgError, setImgError] = useState(false);

  useEffect(() => { if (user) setForm(userToForm(user)); }, [user]);

  if (authLoading) return <LoadingSpinner fullPage />;
  if (!user) return <ErrorMessage message="Unable to load profile" />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError(""); setSuccess("");
  };
  const handleLinkChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, socialLinks: { ...form.socialLinks, [name]: value } });
    setError(""); setSuccess("");
  };

  const handleSave = async () => {
    setSaving(true); setError(""); setSuccess("");
    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      photoURL: form.photoURL.trim(),
      about: form.about.trim(),
      institutionName: form.institutionName.trim(),
      skills: form.skills,
    };
    if (form.educationType) payload.educationType = form.educationType;
    if (form.age) payload.age = Number(form.age);
    if (form.gender) payload.gender = form.gender;
    payload.socialLinks = Object.fromEntries(Object.entries(form.socialLinks).map(([k, v]) => [k, v.trim()]));
    if (form.developerRole) payload.developerRole = form.developerRole;
    if (form.experienceLevel) payload.experienceLevel = form.experienceLevel;
    if (form.collaborationInterests?.length > 0) payload.collaborationInterests = form.collaborationInterests;
    if (form.githubUsername?.trim()) payload.githubUsername = form.githubUsername.trim();
    if (form.location?.trim()) payload.location = form.location.trim();
    if (form.availability) payload.availability = form.availability;
    try {
      const data = await updateProfile(payload);
      setUser(data.data);
      setSuccess(data.message || "Profile updated successfully");
      setEditing(false);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => { setForm(userToForm(user)); setEditing(false); setError(""); setSuccess(""); };

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  const initials = fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  // ── Edit mode ──────────────────────────────────────────────────────────────
  if (editing) return (
    <div className="page-container profile-page">
      <div className="page-header">
        <h1>Edit Profile</h1>
      </div>
      <div className="profile-card">
        {error && <ErrorMessage message={error} />}

        <div className="form-row">
          <div className="form-group"><label>First Name</label><input name="firstName" value={form.firstName} onChange={handleChange} disabled={saving} /></div>
          <div className="form-group"><label>Last Name</label><input name="lastName" value={form.lastName} onChange={handleChange} disabled={saving} /></div>
        </div>
        <div className="form-group"><label>Profile Image URL</label><input name="photoURL" type="url" value={form.photoURL} onChange={handleChange} disabled={saving} /></div>
        <div className="form-row">
          <div className="form-group"><label>Age</label><input name="age" type="number" min="18" value={form.age} onChange={handleChange} disabled={saving} /></div>
          <div className="form-group"><label>Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange} disabled={saving}>
              <option value="">Prefer not to say</option>
              <option value="male">Male</option><option value="female">Female</option><option value="others">Others</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Education</label>
            <select name="educationType" value={form.educationType} onChange={handleChange} disabled={saving}>
              <option value="">Select one</option><option value="school">School</option><option value="college">College</option>
            </select>
          </div>
          {form.educationType && (
            <div className="form-group"><label>{form.educationType === "school" ? "School" : "College"} Name</label>
              <input name="institutionName" value={form.institutionName} onChange={handleChange} disabled={saving} />
            </div>
          )}
        </div>

        <fieldset className="form-section">
          <legend>Developer Profile</legend>
          <div className="form-row">
            <div className="form-group"><label>Developer Role</label>
              <select name="developerRole" value={form.developerRole} onChange={handleChange} disabled={saving}>
                <option value="">Select role</option>
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Experience Level</label>
              <select name="experienceLevel" value={form.experienceLevel} onChange={handleChange} disabled={saving}>
                <option value="">Select level</option>
                <option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Availability</label>
              <select name="availability" value={form.availability} onChange={handleChange} disabled={saving}>
                <option value="">Select</option>
                <option value="Available">Available</option><option value="Open to Opportunities">Open to Opportunities</option><option value="Busy">Busy</option>
              </select>
            </div>
            <div className="form-group"><label>Location</label>
              <input name="location" value={form.location} onChange={handleChange} disabled={saving} placeholder="City, Country" />
            </div>
          </div>
          <div className="form-group"><label>GitHub Username</label>
            <input name="githubUsername" value={form.githubUsername} onChange={handleChange} disabled={saving} placeholder="your-github-username" />
          </div>
          <div className="form-group">
            <label>Collaboration Interests</label>
            <div className="checkbox-group">
              {INTERESTS.map((interest) => (
                <label key={interest} className="checkbox-label">
                  <input type="checkbox" checked={form.collaborationInterests?.includes(interest) || false}
                    onChange={(e) => {
                      const updated = e.target.checked
                        ? [...(form.collaborationInterests || []), interest]
                        : (form.collaborationInterests || []).filter((i) => i !== interest);
                      setForm({ ...form, collaborationInterests: updated });
                    }} disabled={saving} />
                  {interest}
                </label>
              ))}
            </div>
          </div>
        </fieldset>

        <fieldset className="form-section">
          <legend>Tech Stack</legend>
          <TechStackEditor
            skills={form.skills}
            onChange={(skills) => setForm({ ...form, skills })}
            disabled={saving}
          />
        </fieldset>

        <fieldset className="form-section">
          <legend>About & Links</legend>
          <div className="form-group"><label>Bio</label>
            <textarea name="about" rows={4} placeholder="Write a short bio about yourself…" value={form.about} onChange={handleChange} disabled={saving} />
          </div>
          <p className="form-hint">Use complete URLs including https://</p>
          <div className="form-row">
            {Object.entries(LINK_LABELS).map(([key, label]) => (
              <div className="form-group" key={key}>
                <label>{label}</label>
                <input name={key} type="url" placeholder="https://…" value={form.socialLinks[key]} onChange={handleLinkChange} disabled={saving} />
              </div>
            ))}
          </div>
        </fieldset>

        <div className="profile-actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button>
          <button className="btn btn-ghost" onClick={handleCancel} disabled={saving}>Cancel</button>
        </div>
      </div>
    </div>
  );

  // ── View mode ──────────────────────────────────────────────────────────────
  return (
    <div className="page-container profile-page">
      <div className="page-header"><h1>Profile</h1></div>
      <div className="profile-card">
        <GithubProfile username={user.githubUsername} />

        {success && <div className="form-success">{success}</div>}

        {/* Readiness */}
        <ReadinessBar readiness={user.collaborationReadiness} />

        <div className="profile-view">
          <div className="profile-image">
            {user.photoURL && !imgError
              ? <img src={user.photoURL} alt={fullName} onError={() => setImgError(true)} />
              : <div className="profile-avatar">{initials}</div>}
          </div>
          <div className="profile-info">
            <h2>{fullName}</h2>

            <div className="profile-completion">
              <strong>Profile Completion</strong>
              <span>{user.profileCompletion ?? 0}%</span>
              {user.profileSuggestions?.length > 0 && (
                <ul>{user.profileSuggestions.map((s) => <li key={s}>{s}</li>)}</ul>
              )}
            </div>

            {user.developerRole && <p className="profile-detail"><span className="detail-label">Role</span><span>{user.developerRole}</span></p>}
            {user.experienceLevel && <p className="profile-detail"><span className="detail-label">Experience</span><span>{user.experienceLevel}</span></p>}
            {user.availability && (
              <p className="profile-detail">
                <span className="detail-label">Availability</span>
                <span className={`availability-badge availability-${user.availability.toLowerCase().replace(/\s+/g, "-")}`}>{user.availability}</span>
              </p>
            )}
            {user.location && <p className="profile-detail"><span className="detail-label">Location</span><span>{user.location}</span></p>}
            {user.githubUsername && (
              <p className="profile-detail">
                <span className="detail-label">GitHub</span>
                <span><a href={`https://github.com/${user.githubUsername}`} target="_blank" rel="noreferrer">@{user.githubUsername}</a></span>
              </p>
            )}
            {user.skills?.length > 0 && (
              <p className="profile-detail">
                <span className="detail-label">Skills</span>
                <span className="interests-tags">{user.skills.map((s) => <span key={s} className="interest-tag">{s}</span>)}</span>
              </p>
            )}
            {user.collaborationInterests?.length > 0 && (
              <p className="profile-detail">
                <span className="detail-label">Interests</span>
                <span className="interests-tags">{user.collaborationInterests.map((i) => <span key={i} className="interest-tag">{i}</span>)}</span>
              </p>
            )}
            {user.educationType && user.institutionName && (
              <p className="profile-detail">
                <span className="detail-label">{user.educationType === "school" ? "School" : "College"}</span>
                <span>{user.institutionName}</span>
              </p>
            )}
            {user.age && <p className="profile-detail"><span className="detail-label">Age</span><span>{user.age}</span></p>}
            {user.gender && <p className="profile-detail"><span className="detail-label">Gender</span><span>{user.gender}</span></p>}
            {user.about && <p className="profile-detail"><span className="detail-label">About</span><span>{user.about}</span></p>}
            <p className="profile-detail"><span className="detail-label">Email</span><span>{user.emailId}</span></p>
            {Object.entries(user.socialLinks || {}).some(([, url]) => url) && (
              <div className="profile-links">
                {Object.entries(user.socialLinks).filter(([, url]) => url).map(([key, url]) => (
                  <a key={key} href={url} target="_blank" rel="noreferrer">{LINK_LABELS[key] || key}</a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="profile-actions">
          <button className="btn btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
        </div>
      </div>
    </div>
  );
}
