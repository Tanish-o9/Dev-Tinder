import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import { getConnections, getDeveloperCompatibility } from "../services/userApi";

const scoreColor = (s) => s >= 70 ? "var(--accent)" : s >= 40 ? "var(--warning, #f59e0b)" : "var(--text-muted)";

function ConnectionCard({ conn, onChat }) {
  const [score, setScore] = useState(null);
  const name = `${conn.firstName || ""} ${conn.lastName || ""}`.trim();
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  useEffect(() => {
    getDeveloperCompatibility(conn._id)
      .then((res) => setScore(res.data?.overallScore ?? null))
      .catch(() => {});
  }, [conn._id]);

  return (
    <div className="connection-card">
      <Link to={`/profile/${conn._id}`} className="connection-profile-link" aria-label={`View ${name}'s profile`}>
        <div className="connection-card-image">
          {conn.photoURL ? <img src={conn.photoURL} alt={name} /> : <div className="connection-avatar">{initials}</div>}
        </div>
      </Link>
      <div className="connection-card-body">
        <div className="connection-name-row">
          <h3><Link to={`/profile/${conn._id}`} className="connection-profile-link">{name}</Link></h3>
          {score !== null && (
            <span className="connection-match-score" style={{ color: scoreColor(score) }}>{score}% match</span>
          )}
        </div>
        {conn.developerRole && <p className="connection-role">{conn.developerRole}</p>}
        {conn.location && <p className="connection-location">{conn.location}</p>}
        {conn.experienceLevel && <p className="connection-experience"><span className="experience-badge">{conn.experienceLevel}</span></p>}
        {conn.collaborationInterests?.length > 0 && (
          <div className="connection-interests">
            {conn.collaborationInterests.slice(0, 3).map((i) => <span key={i} className="interest-tag">{i}</span>)}
          </div>
        )}
        {conn.about && <p className="connection-about">{conn.about}</p>}
        <div className="connection-card-actions">
          <button className="btn btn-primary" onClick={() => onChat(conn._id)}>Chat</button>
        </div>
      </div>
    </div>
  );
}

export default function Connections() {
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadConnections = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getConnections();
      setConnections(data.data || []);
    } catch (err) {
      setError(err.message || "Unable to load connections");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  if (loading) return <LoadingSpinner fullPage />;

  if (error) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Your Network</h1>
        </div>
        <ErrorMessage message={error} onRetry={loadConnections} />
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Your Network</h1>
        </div>
        <EmptyState
          title="You have no connections yet"
          message="Start discovering developers and building your network."
          actionLabel="Discover Developers"
          onAction={() => navigate("/feed")}
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Your Network</h1>
        <p className="page-subtitle">
          {connections.length} connection{connections.length > 1 ? "s" : ""}
        </p>
      </div>
      <div className="connections-grid">
        {connections.map((conn) => (
          <ConnectionCard key={conn._id} conn={conn} onChat={(id) => navigate(`/chat?user=${id}`)} />
        ))}
      </div>
    </div>
  );
}
