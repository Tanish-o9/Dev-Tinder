import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProject, getProjectApplications, reviewProjectApplication } from "../services/projectApi";
import { useAuth } from "../hooks/useAuth";
import ApplicantCard from "../components/ApplicantCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";

export default function ProjectApplications() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [projectData, appsData] = await Promise.all([
        getProject(projectId),
        getProjectApplications(projectId),
      ]);
      setProject(projectData.data);
      setItems(appsData.data || []);
    } catch (err) {
      setError(err.message || "Unable to load applications");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const review = async (id, status) => {
    try {
      setReviewing(id);
      await reviewProjectApplication(projectId, id, status);
      setItems((all) => all.map((item) => item._id === id ? { ...item, status } : item));
    } catch (err) {
      setError(err.message || "Could not review application");
    } finally {
      setReviewing("");
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  const pending = items.filter((i) => i.status === "pending");
  const reviewed = items.filter((i) => i.status !== "pending");

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Applications{project ? ` — ${project.title}` : ""}</h1>
        <p className="page-subtitle">{pending.length} pending · {reviewed.length} reviewed</p>
      </div>
      {error && <ErrorMessage message={error} onRetry={load} />}
      {!items.length
        ? <EmptyState title="No applications yet" message="Applications from interested developers will appear here." />
        : (
          <section className="project-applications">
            {pending.map((item) => (
              <ApplicantCard key={item._id} application={item} projectOwner={user} onReview={review} loading={reviewing === item._id} />
            ))}
            {reviewed.length > 0 && (
              <>
                <h2 className="applications-section-title">Reviewed</h2>
                {reviewed.map((item) => (
                  <ApplicantCard key={item._id} application={item} projectOwner={user} onReview={review} loading={reviewing === item._id} />
                ))}
              </>
            )}
          </section>
        )
      }
    </div>
  );
}
