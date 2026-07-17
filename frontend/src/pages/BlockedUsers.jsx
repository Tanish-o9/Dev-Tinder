import { useCallback, useEffect, useState } from "react";
import { getBlockedUsers, unblockUser } from "../services/userApi";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";

export default function BlockedUsers() {
  const [blocked, setBlocked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unblocking, setUnblocking] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getBlockedUsers();
      setBlocked(res.data || []);
    } catch (err) {
      setError(err.message || "Unable to load blocked users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUnblock = async (userId) => {
    setUnblocking(userId);
    try {
      await unblockUser(userId);
      setBlocked((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      setError(err.message || "Failed to unblock user. Please try again.");
    } finally {
      setUnblocking(null);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Blocked Users</h1>
        <p className="page-subtitle">Blocked users cannot send you connection requests or appear in your feed.</p>
      </div>

      {error && <ErrorMessage message={error} onRetry={load} />}

      {!error && blocked.length === 0 ? (
        <EmptyState title="No blocked users" message="You haven't blocked anyone." />
      ) : (
        <ul className="blocked-list">
          {blocked.map((user) => {
            const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
            const initials = name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
            return (
              <li key={user._id} className="blocked-item">
                <div className="blocked-item-avatar">
                  {user.photoURL
                    ? <img src={user.photoURL} alt={name} />
                    : <span>{initials}</span>}
                </div>
                <div className="blocked-item-info">
                  <p className="blocked-item-name">{name}</p>
                  {user.developerRole && <p className="blocked-item-role">{user.developerRole}</p>}
                </div>
                <button
                  className="btn btn-outline"
                  onClick={() => handleUnblock(user._id)}
                  disabled={unblocking === user._id}
                >
                  {unblocking === user._id ? "Unblocking…" : "Unblock"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
