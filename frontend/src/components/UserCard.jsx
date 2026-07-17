import { useState } from "react";
import MatchBreakdown from "./MatchBreakdown";

export default function UserCard({ user, onInterested, onIgnored, onSave, onRemoveSaved, loading }) {
  const [imgError, setImgError] = useState(false);

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  const displayAge = user.age ? `${user.age} yrs` : null;
  const displayGender = user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : null;

  const scoreColor =
    typeof user.matchScore === "number"
      ? user.matchScore >= 75 ? "var(--success)" : user.matchScore >= 45 ? "var(--accent)" : "var(--warning)"
      : "var(--accent)";

  return (
    <div className="user-card">
      <div className="user-card-image">
        {user.photoURL && !imgError ? (
          <img src={user.photoURL} alt={fullName} onError={() => setImgError(true)} />
        ) : (
          <div className="user-card-avatar">
            {fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
          </div>
        )}
      </div>

      <div className="user-card-body">
        <h2 className="user-card-name">{fullName}</h2>

        {user.developerRole && <p className="user-card-role">{user.developerRole}</p>}

        {typeof user.matchScore === "number" && (
          <div className="user-card-match-row">
            <span className="user-card-match-score" style={{ color: scoreColor }}>
              {user.matchScore}% Match
            </span>
            <MatchBreakdown userId={user._id} userName={fullName} />
          </div>
        )}

        {user.location && <p className="user-card-location">{user.location}</p>}

        {(displayAge || displayGender) && (
          <p className="user-card-meta">
            {displayAge && <span>{displayAge}</span>}
            {displayAge && displayGender && <span className="meta-dot">&middot;</span>}
            {displayGender && <span>{displayGender}</span>}
          </p>
        )}

        {user.experienceLevel && (
          <p className="user-card-experience">
            <span className="experience-badge">{user.experienceLevel}</span>
          </p>
        )}

        {user.collaborationInterests?.length > 0 && (
          <div className="user-card-interests">
            {user.collaborationInterests.slice(0, 3).map((i) => (
              <span key={i} className="interest-tag">{i}</span>
            ))}
          </div>
        )}

        {user.about && <p className="user-card-about">{user.about}</p>}

        {user.commonSkills?.length > 0 && (
          <div className="user-card-common-skills">
            <span className="user-card-common-label">Common skills</span>
            <div className="user-card-interests">
              {user.commonSkills.map((s) => (
                <span key={s} className="interest-tag interest-tag--accent">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="user-card-actions">
        {onRemoveSaved ? (
          <button className="btn btn-outline" onClick={() => onRemoveSaved(user._id)} disabled={loading}>
            Remove saved
          </button>
        ) : (
          <>
            {onSave && (
              <button className="btn btn-outline" onClick={() => onSave(user._id)} disabled={loading}>
                Save
              </button>
            )}
            <button className="btn btn-ignore" onClick={() => onIgnored?.(user._id)} disabled={loading} aria-label="Ignore developer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Ignore
            </button>
            <button className="btn btn-interested" onClick={() => onInterested?.(user._id)} disabled={loading} aria-label="Interested in developer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              Connect
            </button>
          </>
        )}
      </div>
    </div>
  );
}
