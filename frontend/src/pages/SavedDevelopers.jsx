import { useCallback, useEffect, useState } from "react";
import UserCard from "../components/UserCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import { getSavedDevelopers, removeSavedDeveloper } from "../services/userApi";

export default function SavedDevelopers() {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const result = await getSavedDevelopers();
      setDevelopers(result.data || []);
    } catch (err) {
      setError(err.message || "Unable to load saved developers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (userId) => {
    try {
      setRemoving(userId);
      await removeSavedDeveloper(userId);
      setDevelopers((items) => items.filter((developer) => developer._id !== userId));
    } catch (err) {
      setError(err.message || "Could not remove saved developer");
    } finally {
      setRemoving("");
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Saved Developers</h1>
        <p className="page-subtitle">Profiles you want to revisit.</p>
      </div>
      {error && <ErrorMessage message={error} onRetry={load} />}
      {!developers.length
        ? <EmptyState title="No saved developers" message="Save promising developers from Discover to keep their profile handy." />
        : <div className="saved-developers-grid">{developers.map((developer) => <UserCard key={developer._id} user={developer} onRemoveSaved={remove} loading={removing === developer._id} />)}</div>
      }
    </div>
  );
}
