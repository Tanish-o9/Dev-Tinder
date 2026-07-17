import { useState } from "react";
import { updateProfile } from "../services/userApi";
import { useAuth } from "../hooks/useAuth";
import TechStackEditor from "./TechStackEditor";

const ROLES = [
  "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "Mobile Developer", "AI/ML Engineer", "Data Scientist", "DevOps Engineer",
  "Cloud Engineer", "Cybersecurity Engineer", "UI/UX Developer",
  "Blockchain Developer", "Other",
];
const INTERESTS = [
  "Hackathons", "Open Source", "Startup", "College Projects",
  "AI Projects", "Web Development", "Mobile Development", "Research",
];
const AVAILABILITY = ["Available", "Open to Opportunities", "Busy"];

const STEPS = [
  { id: "role", title: "What kind of developer are you?", subtitle: "This helps us find the best matches for you." },
  { id: "skills", title: "What are your top skills?", subtitle: "Add up to 30 skills from our taxonomy." },
  { id: "interests", title: "What do you want to build?", subtitle: "Select the types of projects you're interested in." },
  { id: "availability", title: "Are you open to collaborating?", subtitle: "Let others know your current availability." },
];

export default function OnboardingWizard({ onComplete }) {
  const { setUser } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    developerRole: "",
    experienceLevel: "",
    skills: [],
    collaborationInterests: [],
    availability: "",
  });

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const canAdvance = () => {
    if (current.id === "role") return Boolean(form.developerRole) && Boolean(form.experienceLevel);
    if (current.id === "skills") return form.skills.length > 0;
    if (current.id === "interests") return form.collaborationInterests.length > 0;
    if (current.id === "availability") return Boolean(form.availability);
    return true;
  };

  const handleNext = async () => {
    if (!isLast) { setStep((s) => s + 1); return; }
    setSaving(true);
    setError("");
    try {
      const payload = {};
      if (form.developerRole) payload.developerRole = form.developerRole;
      if (form.experienceLevel) payload.experienceLevel = form.experienceLevel;
      if (form.skills?.length > 0) payload.skills = form.skills;
      if (form.collaborationInterests?.length > 0) payload.collaborationInterests = form.collaborationInterests;
      if (form.availability) payload.availability = form.availability;

      const data = await updateProfile(payload);
      setUser(data.data);
      onComplete();
    } catch (err) {
      setError(err.message || "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  const toggleInterest = (interest) => {
    setForm((f) => ({
      ...f,
      collaborationInterests: f.collaborationInterests.includes(interest)
        ? f.collaborationInterests.filter((i) => i !== interest)
        : [...f.collaborationInterests, interest],
    }));
  };

  return (
    <div className="wizard-overlay" role="dialog" aria-modal="true" aria-label="Complete your profile">
      <div className="wizard-card">
        {/* Progress bar */}
        <div className="wizard-progress">
          {STEPS.map((s, i) => (
            <div key={s.id} className={`wizard-step-dot${i <= step ? " active" : ""}${i < step ? " done" : ""}`} />
          ))}
        </div>

        <div className="wizard-header">
          <p className="wizard-step-label">Step {step + 1} of {STEPS.length}</p>
          <h2>{current.title}</h2>
          <p className="wizard-subtitle">{current.subtitle}</p>
        </div>

        <div className="wizard-body">
          {current.id === "role" && (
            <>
              <div className="wizard-role-grid">
                {ROLES.filter((r) => r !== "Other").map((role) => (
                  <button
                    key={role}
                    type="button"
                    className={`wizard-role-chip${form.developerRole === role ? " selected" : ""}`}
                    onClick={() => setForm({ ...form, developerRole: role })}
                  >
                    {role}
                  </button>
                ))}
              </div>
              <div className="wizard-field">
                <label>Experience level</label>
                <div className="wizard-exp-row">
                  {["Beginner", "Intermediate", "Advanced"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      className={`wizard-role-chip${form.experienceLevel === level ? " selected" : ""}`}
                      onClick={() => setForm({ ...form, experienceLevel: level })}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {current.id === "skills" && (
            <TechStackEditor
              skills={form.skills}
              onChange={(skills) => setForm({ ...form, skills })}
            />
          )}

          {current.id === "interests" && (
            <div className="wizard-interests-grid">
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  className={`wizard-role-chip${form.collaborationInterests.includes(interest) ? " selected" : ""}`}
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </button>
              ))}
            </div>
          )}

          {current.id === "availability" && (
            <div className="wizard-avail-list">
              {AVAILABILITY.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`wizard-avail-option${form.availability === opt ? " selected" : ""}`}
                  onClick={() => setForm({ ...form, availability: opt })}
                >
                  <span className={`avail-dot avail-${opt.toLowerCase().replace(/\s+/g, "-")}`} />
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && <p className="wizard-error">{error}</p>}

        <div className="wizard-footer">
          {step > 0 && (
            <button className="btn btn-ghost" onClick={() => setStep((s) => s - 1)} disabled={saving}>
              Back
            </button>
          )}
          <button
            className="btn btn-primary wizard-next-btn"
            onClick={handleNext}
            disabled={!canAdvance() || saving}
          >
            {saving ? "Saving…" : isLast ? "Complete Profile" : "Next →"}
          </button>
          {!isLast && (
            <button className="btn btn-ghost wizard-skip" onClick={() => setStep((s) => s + 1)}>
              Skip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
