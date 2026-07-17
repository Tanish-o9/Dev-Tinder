import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { signup } from "../services/authApi";
import { useAuth } from "../hooks/useAuth";
import { validateSignupForm } from "../utils/validation";

export default function Signup() {
  const { user, loading: authLoading, loginUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    emailId: "",
    password: "",
    photoURL: "",
    about: "",
    age: "",
    gender: "",
    educationType: "",
    institutionName: "",
    socialLinks: { linkedin: "", github: "", leetcode: "", gfg: "", codechef: "", codeforces: "", hackerrank: "" },
    developerRole: "",
    experienceLevel: "",
    collaborationInterests: [],
    githubUsername: "",
    skills: "",
    location: "",
    availability: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  if (authLoading) return null;
  if (user) return <Navigate to="/feed" replace />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
    if (apiError) setApiError("");
  };

  const handleLinkChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, socialLinks: { ...form.socialLinks, [name]: value } });
    if (apiError) setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    const validationErrors = validateSignupForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      emailId: form.emailId.trim(),
      password: form.password,
    };

    if (form.photoURL?.trim()) payload.photoURL = form.photoURL.trim();
    if (form.about?.trim()) payload.about = form.about.trim();
    if (form.age) payload.age = Number(form.age);
    if (form.gender) payload.gender = form.gender;
    if (form.educationType) payload.educationType = form.educationType;
    if (form.institutionName.trim()) payload.institutionName = form.institutionName.trim();
    const socialLinks = Object.fromEntries(Object.entries(form.socialLinks).filter(([, url]) => url.trim()));
    if (Object.keys(socialLinks).length) payload.socialLinks = socialLinks;

    if (form.developerRole) payload.developerRole = form.developerRole;
    if (form.experienceLevel) payload.experienceLevel = form.experienceLevel;
    if (form.collaborationInterests.length > 0) payload.collaborationInterests = form.collaborationInterests;
    if (form.githubUsername?.trim()) payload.githubUsername = form.githubUsername.trim();
    if (form.skills?.trim()) payload.skills = form.skills.split(",").map((skill) => skill.trim()).filter(Boolean);
    if (form.location?.trim()) payload.location = form.location.trim();
    if (form.availability) payload.availability = form.availability;

    setLoading(true);
    try {
      const data = await signup(payload);
      loginUser(data.data);
      navigate("/feed");
    } catch (err) {
      setApiError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-branding">
        <div className="auth-branding-content">
          <div className="brand-logo">{'</>'}</div>
          <h1>DevTinder</h1>
          <p className="brand-tagline">
            Join a community of developers building the future.
          </p>
        </div>
      </div>

      <div className="auth-form-container">
        <div className="auth-card auth-card-wide">
          <h2>Create your account</h2>
          <p className="auth-subtitle">Start connecting with developers</p>

          <form onSubmit={handleSubmit} noValidate>
            {apiError && <div className="form-error">{apiError}</div>}

            <fieldset className="form-section">
              <legend>Basic Information</legend>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    value={form.firstName}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {errors.firstName && <span className="field-error">{errors.firstName}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    value={form.lastName}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="emailId">Email *</label>
                <input
                  id="emailId"
                  name="emailId"
                  type="email"
                  placeholder="you@example.com"
                  value={form.emailId}
                  onChange={handleChange}
                  autoComplete="email"
                  disabled={loading}
                />
                {errors.emailId && <span className="field-error">{errors.emailId}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <div className="password-input-wrapper">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>
            </fieldset>

            <fieldset className="form-section">
              <legend>Developer Profile</legend>
              <div className="form-group">
                <label htmlFor="photoURL">Profile Image URL</label>
                <input
                  id="photoURL"
                  name="photoURL"
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={form.photoURL}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </fieldset>

            <fieldset className="form-section">
              <legend>Additional Information</legend>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="age">Age</label>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    min="18"
                    max="120"
                    placeholder="25"
                    value={form.age}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="gender">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="others">Others</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="educationType">Currently studying in</label>
                  <select id="educationType" name="educationType" value={form.educationType} onChange={handleChange} disabled={loading}>
                    <option value="">Select school or college</option>
                    <option value="school">School</option>
                    <option value="college">College</option>
                  </select>
                </div>
                {form.educationType && (
                  <div className="form-group">
                    <label htmlFor="institutionName">{form.educationType === "school" ? "School" : "College"} Name</label>
                    <input id="institutionName" name="institutionName" type="text" placeholder={`Your ${form.educationType} name`} value={form.institutionName} onChange={handleChange} disabled={loading} />
                  </div>
                )}
              </div>
            </fieldset>

            <fieldset className="form-section">
              <legend>Developer Profile & Preferences</legend>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="developerRole">Developer Role</label>
                  <select id="developerRole" name="developerRole" value={form.developerRole} onChange={handleChange} disabled={loading}>
                    <option value="">Select your role</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Full Stack Developer">Full Stack Developer</option>
                    <option value="Mobile Developer">Mobile Developer</option>
                    <option value="AI/ML Engineer">AI/ML Engineer</option>
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="DevOps Engineer">DevOps Engineer</option>
                    <option value="Cloud Engineer">Cloud Engineer</option>
                    <option value="Cybersecurity Engineer">Cybersecurity Engineer</option>
                    <option value="UI/UX Developer">UI/UX Developer</option>
                    <option value="Blockchain Developer">Blockchain Developer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="experienceLevel">Experience Level</label>
                  <select id="experienceLevel" name="experienceLevel" value={form.experienceLevel} onChange={handleChange} disabled={loading}>
                    <option value="">Select experience level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="availability">Availability</label>
                  <select id="availability" name="availability" value={form.availability} onChange={handleChange} disabled={loading}>
                    <option value="">Select availability</option>
                    <option value="Available">Available</option>
                    <option value="Open to Opportunities">Open to Opportunities</option>
                    <option value="Busy">Busy</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input id="location" name="location" type="text" placeholder="City, Country" value={form.location} onChange={handleChange} disabled={loading} />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="githubUsername">GitHub Username</label>
                <input id="githubUsername" name="githubUsername" type="text" placeholder="your-github-username" value={form.githubUsername} onChange={handleChange} disabled={loading} />
              </div>
              <div className="form-group">
                <label htmlFor="skills">Skills</label>
                <input id="skills" name="skills" type="text" placeholder="React, Node.js, MongoDB" value={form.skills} onChange={handleChange} disabled={loading} />
              </div>
              <div className="form-group">
                <label>Collaboration Interests</label>
                <p className="form-hint">Select the types of projects you're interested in collaborating on.</p>
                <div className="checkbox-group">
                  {["Hackathons", "Open Source", "Startup", "College Projects", "AI Projects", "Web Development", "Mobile Development", "Research"].map((interest) => (
                    <label key={interest} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={form.collaborationInterests.includes(interest)}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...form.collaborationInterests, interest]
                            : form.collaborationInterests.filter((i) => i !== interest);
                          setForm({ ...form, collaborationInterests: updated });
                        }}
                        disabled={loading}
                      />
                      {interest}
                    </label>
                  ))}
                </div>
              </div>
            </fieldset>

            <fieldset className="form-section">
              <legend>Professional & Coding Profiles</legend>
              <p className="form-hint">Optional. Add full profile URLs (including https://).</p>
              <div className="form-group">
                <label htmlFor="about">Description</label>
                <textarea id="about" name="about" placeholder="Write a short description about yourself, your skills, and interests..." value={form.about} onChange={handleChange} rows={3} disabled={loading} />
              </div>
              <div className="form-row">
                {Object.entries({ linkedin: "LinkedIn", github: "GitHub", leetcode: "LeetCode", gfg: "GeeksforGeeks", codechef: "CodeChef", codeforces: "Codeforces", hackerrank: "HackerRank" }).map(([key, label]) => (
                  <div className="form-group" key={key}>
                    <label htmlFor={key}>{label}</label>
                    <input id={key} name={key} type="url" placeholder="https://..." value={form.socialLinks[key]} onChange={handleLinkChange} disabled={loading} />
                  </div>
                ))}
              </div>
            </fieldset>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
