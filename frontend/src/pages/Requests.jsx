import { useState, useEffect, useCallback } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import { getReceivedRequests, getDeveloperCompatibility } from "../services/userApi";
import { reviewRequest } from "../services/requestApi";

const scoreColor = (s) => s >= 70 ? "var(--accent)" : s >= 40 ? "var(--warning, #f59e0b)" : "var(--text-muted)";

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scores, setScores] = useState({}); // requestId → overallScore
  const linkLabels = { linkedin: "LinkedIn", github: "GitHub", leetcode: "LeetCode", gfg: "GeeksforGeeks", codechef: "CodeChef", codeforces: "Codeforces", hackerrank: "HackerRank" };

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getReceivedRequests();
      const list = data.data || [];
      setRequests(list);
      // Fetch compatibility scores for all senders in parallel
      list.forEach((req) => {
        getDeveloperCompatibility(req.fromUserId._id)
          .then((res) => setScores((prev) => ({ ...prev, [req._id]: res.data?.overallScore ?? null })))
          .catch(() => {});
      });
    } catch (err) {
      setError(err.message || "Unable to load requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleReview = async (status, requestId) => {
    try {
      await reviewRequest(status, requestId);
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch (err) {
      setError(err.message || "Failed to update request");
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  if (error) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Connection Requests</h1>
        </div>
        <ErrorMessage message={error} onRetry={loadRequests} />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Connection Requests</h1>
        </div>
        <EmptyState
          title="No pending connection requests"
          message="When other developers express interest in connecting, their requests will appear here."
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Connection Requests</h1>
        <p className="page-subtitle">
          {requests.length} pending request{requests.length > 1 ? "s" : ""}
        </p>
      </div>
      <div className="requests-list">
        {requests.map((req) => {
          const sender = req.fromUserId;
          const senderName = `${sender.firstName || ""} ${sender.lastName || ""}`.trim();
          const initials = senderName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

          return (
            <div key={req._id} className="request-card">
              <div className="request-card-image">
                {sender.photoURL ? (
                  <img src={sender.photoURL} alt={senderName} />
                ) : (
                  <div className="request-avatar">{initials}</div>
                )}
              </div>
              <div className="request-card-body">
                <div className="connection-name-row">
                  <h3>{senderName}</h3>
                  {scores[req._id] != null && (
                    <span className="connection-match-score" style={{ color: scoreColor(scores[req._id]) }}>
                      {scores[req._id]}% match
                    </span>
                  )}
                </div>
                {sender.developerRole && <p className="request-role">{sender.developerRole}</p>}
                {sender.location && <p className="request-location">{sender.location}</p>}
                {sender.experienceLevel && <p className="request-experience"><span className="experience-badge">{sender.experienceLevel}</span></p>}
                {sender.collaborationInterests?.length > 0 && (
                  <div className="request-interests">
                    {sender.collaborationInterests.slice(0, 3).map((i) => <span key={i} className="interest-tag">{i}</span>)}
                  </div>
                )}
                {sender.about && <p className="request-about">{sender.about}</p>}
                <div className="request-meta">
                  {sender.age && <span>{sender.age} yrs</span>}
                  {sender.age && sender.gender && <span className="meta-dot">&middot;</span>}
                  {sender.gender && (
                    <span>
                      {sender.gender.charAt(0).toUpperCase() + sender.gender.slice(1)}
                    </span>
                  )}
                </div>
                {sender.educationType && sender.institutionName && (
                  <p className="request-education">{sender.educationType === "school" ? "School" : "College"}: {sender.institutionName}</p>
                )}
                {Object.entries(sender.socialLinks || {}).some(([, url]) => url) && (
                  <div className="profile-links request-links">
                    {Object.entries(sender.socialLinks).filter(([, url]) => url).map(([key, url]) => (
                      <a key={key} href={url} target="_blank" rel="noreferrer">{linkLabels[key] || key}</a>
                    ))}
                  </div>
                )}
              </div>
              <div className="request-card-actions">
                <button
                  className="btn btn-accept"
                  onClick={() => handleReview("accepted", req._id)}
                  aria-label="Accept connection request"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Accept
                </button>
                <button
                  className="btn btn-reject"
                  onClick={() => handleReview("rejected", req._id)}
                  aria-label="Reject connection request"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
