import { useEffect, useRef, useState } from "react";
import { reportUser } from "../services/userApi";

const REASONS = ["Spam", "Harassment", "Fake Profile", "Inappropriate Content", "Other"];

export default function ReportDialog({ userId, userName, onClose }) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const dialogRef = useRef(null);

  // Trap focus and handle Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) return setError("Please select a reason.");
    setSubmitting(true);
    setError("");
    try {
      await reportUser(userId, reason, description);
      setDone(true);
    } catch (err) {
      setError(err.message || "Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dialog-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="report-dialog-title" ref={dialogRef} tabIndex={-1}>
        {done ? (
          <div className="dialog-done">
            <span className="dialog-done-icon">✓</span>
            <p className="dialog-done-title">Report submitted</p>
            <p className="dialog-done-hint">Thank you for helping keep the community safe. We'll review your report.</p>
            <button className="btn btn-primary" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div className="dialog-header">
              <h2 id="report-dialog-title">Report {userName}</h2>
              <button className="dialog-close" onClick={onClose} aria-label="Close">✕</button>
            </div>
            <form className="dialog-body" onSubmit={handleSubmit}>
              <p className="dialog-hint">Reports are private and not shared with the reported user.</p>
              {error && <p className="form-error">{error}</p>}
              <div className="form-group">
                <label htmlFor="report-reason">Reason</label>
                <select
                  id="report-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                >
                  <option value="">Select a reason…</option>
                  {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="report-desc">Additional details <span className="dialog-optional">(optional)</span></label>
                <textarea
                  id="report-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue…"
                  maxLength={1000}
                  rows={3}
                />
              </div>
              <div className="dialog-actions">
                <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>Cancel</button>
                <button type="submit" className="btn btn-danger" disabled={submitting || !reason}>
                  {submitting ? "Submitting…" : "Submit Report"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
