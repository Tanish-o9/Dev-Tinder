import { useEffect, useState } from "react";
import { getDeveloperCompatibility } from "../services/userApi";

const scoreColor = (s) => (s >= 70 ? "var(--accent)" : s >= 40 ? "var(--warning, #f59e0b)" : "var(--text-muted)");

export default function ApplicantCard({ application, projectOwner, onReview, loading }) {
  const applicant = application.applicantId || {};
  const [compat, setCompat] = useState(null);

  useEffect(() => {
    if (!applicant._id || !projectOwner?._id) return;
    getDeveloperCompatibility(applicant._id)
      .then((res) => setCompat(res.data))
      .catch(() => {});
  }, [applicant._id, projectOwner?._id]);

  return (
    <article className="application-card">
      <div className="applicant-header">
        {applicant.photoURL && <img className="applicant-avatar" src={applicant.photoURL} alt="" />}
        <div className="applicant-info">
          <strong>{applicant.firstName} {applicant.lastName}</strong>
          <span className="applicant-role">{applicant.developerRole}</span>
          {application.roleAppliedFor && (
            <span className="role-applied-badge">Applied for: {application.roleAppliedFor}</span>
          )}
        </div>
        {compat && (
          <div className="applicant-compat" style={{ color: scoreColor(compat.overallScore) }}>
            <span className="compat-score">{compat.overallScore}%</span>
            <span className="compat-label">match</span>
          </div>
        )}
      </div>

      {applicant.about && <p className="applicant-about">{applicant.about}</p>}
      {application.message && <p className="applicant-message">"{application.message}"</p>}

      {applicant.skills?.length > 0 && (
        <div className="user-card-interests">
          {applicant.skills.slice(0, 8).map((skill) => (
            <span
              key={skill}
              className={`interest-tag${compat?.commonSkills?.includes(skill) ? " skill-match" : ""}`}
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {compat?.reasons?.length > 0 && (
        <ul className="applicant-reasons">
          {compat.reasons.slice(0, 2).map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      )}

      <div className="applicant-actions">
        {application.status === "pending" ? (
          <>
            <button className="btn btn-accept" disabled={loading} onClick={() => onReview(application._id, "accepted")}>Accept</button>
            <button className="btn btn-reject" disabled={loading} onClick={() => onReview(application._id, "rejected")}>Reject</button>
          </>
        ) : (
          <span className="project-status">{application.status}</span>
        )}
      </div>
    </article>
  );
}
