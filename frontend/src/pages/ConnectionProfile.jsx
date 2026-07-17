import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getConnectionProfile, blockUser, getDeveloperCompatibility } from "../services/userApi";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import GithubProfile from "../components/GithubProfile";
import ReportDialog from "../components/ReportDialog";
import MatchBreakdown from "../components/MatchBreakdown";

const labels = { linkedin: "LinkedIn", github: "GitHub", leetcode: "LeetCode", gfg: "GeeksforGeeks", codechef: "CodeChef", codeforces: "Codeforces", hackerrank: "HackerRank" };
const scoreColor = (s) => s >= 70 ? "var(--accent)" : s >= 40 ? "var(--warning, #f59e0b)" : "var(--text-muted)";

export default function ConnectionProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [compat, setCompat] = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [error, setError] = useState("");
  const [blocking, setBlocking] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setError("");
      const result = await getConnectionProfile(userId);
      setProfile(result.data);
    } catch (err) {
      setError(err.message || "Unable to load this profile");
    }
  }, [userId]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  useEffect(() => {
    if (!userId) return;
    getDeveloperCompatibility(userId)
      .then((res) => setCompat(res.data))
      .catch(() => {});
  }, [userId]);

  const handleBlock = async () => {
    const name = `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim();
    if (!window.confirm(`Block ${name}? This will remove your connection and they won't appear in your feed.`)) return;
    setBlocking(true);
    try {
      await blockUser(userId);
      navigate("/connections");
    } catch (err) {
      setError(err.message || "Failed to block user.");
      setBlocking(false);
    }
  };

  if (error) return <div className="page-container"><ErrorMessage message={error} onRetry={loadProfile} /></div>;
  if (!profile) return <LoadingSpinner fullPage />;

  const name = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
  const initials = name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  const socialLinks = profile.socialLinks || {};
  const availableLinks = Object.entries(labels).filter(([key]) => socialLinks[key]);

  return (
    <div className="page-container profile-page">
      <div className="page-header">
        <h1>Developer Profile</h1>
      </div>

      {compat && (
        <div className="connection-compat-banner">
          <div className="compat-banner-score" style={{ color: scoreColor(compat.overallScore) }}>
            <span className="compat-banner-number">{compat.overallScore}%</span>
            <span className="compat-banner-label">compatibility</span>
          </div>
          {compat.reasons?.length > 0 && (
            <ul className="compat-banner-reasons">
              {compat.reasons.slice(0, 3).map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          )}
          <button className="btn btn-ghost btn-sm" onClick={() => setShowBreakdown(true)}>
            Full breakdown →
          </button>
        </div>
      )}

      <div className="profile-card">
        <GithubProfile username={profile.githubUsername} />
        <div className="profile-view">
          <div className="profile-image">
            {profile.photoURL
              ? <img src={profile.photoURL} alt={name} />
              : <div className="profile-avatar">{initials}</div>}
          </div>
          <div className="profile-info">
            <h2>{name}</h2>
            {profile.developerRole && <p className="profile-detail"><span className="detail-label">Role</span><span>{profile.developerRole}</span></p>}
            {profile.experienceLevel && <p className="profile-detail"><span className="detail-label">Experience</span><span>{profile.experienceLevel}</span></p>}
            {profile.availability && <p className="profile-detail"><span className="detail-label">Availability</span><span className={`availability-badge availability-${profile.availability.toLowerCase().replace(/\s+/g, "-")}`}>{profile.availability}</span></p>}
            {profile.location && <p className="profile-detail"><span className="detail-label">Location</span><span>{profile.location}</span></p>}
            {profile.githubUsername && <p className="profile-detail"><span className="detail-label">GitHub</span><span><a href={`https://github.com/${profile.githubUsername}`} target="_blank" rel="noreferrer">@{profile.githubUsername}</a></span></p>}
            {profile.skills?.length > 0 && (
              <p className="profile-detail">
                <span className="detail-label">Skills</span>
                <span className="interests-tags">
                  {profile.skills.map((s) => (
                    <span key={s} className={`interest-tag${compat?.commonSkills?.includes(s) ? " skill-match" : ""}`}>{s}</span>
                  ))}
                </span>
              </p>
            )}
            {profile.collaborationInterests?.length > 0 && <p className="profile-detail"><span className="detail-label">Interests</span><span className="interests-tags">{profile.collaborationInterests.map((i) => <span key={i} className="interest-tag">{i}</span>)}</span></p>}
            <p className="profile-detail"><span className="detail-label">Age</span><span>{profile.age || "Not added"}</span></p>
            <p className="profile-detail"><span className="detail-label">Gender</span><span>{profile.gender || "Not added"}</span></p>
            <p className="profile-detail"><span className="detail-label">Education</span><span>{profile.educationType && profile.institutionName ? `${profile.educationType === "school" ? "School" : "College"}: ${profile.institutionName}` : "Not added"}</span></p>
            <p className="profile-detail"><span className="detail-label">About</span><span>{profile.about || "Not added"}</span></p>
            {availableLinks.length > 0 && (
              <div className="connection-profile-links">
                <span className="detail-label">Profiles</span>
                <div className="profile-links">
                  {availableLinks.map(([key, label]) => <a key={key} href={socialLinks[key]} target="_blank" rel="noreferrer">{label}</a>)}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="profile-danger-zone">
          <button className="btn btn-outline btn-sm" onClick={() => setShowReport(true)}>Report User</button>
          <button className="btn btn-danger btn-sm" onClick={handleBlock} disabled={blocking}>
            {blocking ? "Blocking…" : "Block User"}
          </button>
        </div>
      </div>

      {showBreakdown && compat && (
        <MatchBreakdown userId={userId} onClose={() => setShowBreakdown(false)} />
      )}

      {showReport && (
        <ReportDialog userId={userId} userName={name} onClose={() => setShowReport(false)} />
      )}
    </div>
  );
}
