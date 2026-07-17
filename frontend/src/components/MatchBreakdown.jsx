import { useEffect, useRef, useState } from "react";
import { getDeveloperCompatibility } from "../services/userApi";

const DIM_LABELS = {
  directSkills: "Direct Skills",
  relatedSkills: "Related Skills",
  complementarySkills: "Complementary Skills",
  collaborationInterests: "Shared Interests",
  roleCompatibility: "Role Compatibility",
  experienceCompatibility: "Experience",
  availability: "Availability",
  projectRelevance: "Project Relevance",
};

function ScoreBar({ value }) {
  const color = value >= 75 ? "var(--success)" : value >= 45 ? "var(--accent)" : "var(--warning)";
  return (
    <div className="mb-score-bar-track">
      <div className="mb-score-bar-fill" style={{ width: `${value}%`, background: color }} />
    </div>
  );
}

export default function MatchBreakdown({ userId, userName, triggerLabel = "Why this match?" }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dialogRef = useRef(null);

  // Load on first open only
  useEffect(() => {
    if (!open || data || loading) return;
    setLoading(true);
    setError("");
    getDeveloperCompatibility(userId)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message || "Could not load compatibility data"))
      .finally(() => setLoading(false));
  }, [open, userId, data, loading]);

  // Trap focus + Escape
  useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();
    const handler = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const overallColor = data
    ? data.overallScore >= 75 ? "var(--success)" : data.overallScore >= 45 ? "var(--accent)" : "var(--warning)"
    : "var(--accent)";

  return (
    <>
      <button className="btn btn-ghost mb-trigger" onClick={() => setOpen(true)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        {triggerLabel}
      </button>

      {open && (
        <div className="dialog-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div
            className="dialog mb-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={`Compatibility breakdown with ${userName}`}
            ref={dialogRef}
            tabIndex={-1}
          >
            <div className="dialog-header">
              <h2>Compatibility with {userName}</h2>
              <button className="dialog-close" onClick={() => setOpen(false)} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="dialog-body mb-body">
              {loading && (
                <div className="mb-state">
                  <div className="spinner" />
                  <p>Analysing compatibility…</p>
                </div>
              )}

              {error && !loading && (
                <div className="mb-state mb-error">
                  <p>{error}</p>
                  <button className="btn btn-outline" onClick={() => { setData(null); setOpen(false); setTimeout(() => setOpen(true), 50); }}>Retry</button>
                </div>
              )}

              {data && !loading && (
                <>
                  {/* Overall score */}
                  <div className="mb-overall">
                    <span className="mb-overall-score" style={{ color: overallColor }}>{data.overallScore}%</span>
                    <span className="mb-overall-label">Overall Compatibility</span>
                  </div>

                  {/* Dimension breakdown */}
                  <div className="mb-section">
                    <p className="mb-section-title">Compatibility Breakdown</p>
                    <div className="mb-dims">
                      {Object.entries(data.dimensions).map(([key, val]) => (
                        <div key={key} className="mb-dim-row">
                          <div className="mb-dim-header">
                            <span className="mb-dim-label">{DIM_LABELS[key] || key}</span>
                            <span className="mb-dim-val">{val}%</span>
                          </div>
                          <ScoreBar value={val} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Match signals */}
                  {data.reasons?.length > 0 && (
                    <div className="mb-section">
                      <p className="mb-section-title">Match Signals</p>
                      <ul className="mb-reasons">
                        {data.reasons.map((r) => (
                          <li key={r}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Common skills */}
                  {data.commonSkills?.length > 0 && (
                    <div className="mb-section">
                      <p className="mb-section-title">Common Skills</p>
                      <div className="mb-tags">
                        {data.commonSkills.map((s) => (
                          <span key={s} className="interest-tag mb-tag-common">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Complementary skills */}
                  {data.complementarySkills?.length > 0 && (
                    <div className="mb-section">
                      <p className="mb-section-title">Complementary Skills</p>
                      <div className="mb-comp-pairs">
                        {data.complementarySkills.slice(0, 4).map((pair, i) => (
                          <div key={i} className="mb-comp-pair">
                            <span className="interest-tag">{pair.viewerSkill}</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                            </svg>
                            <span className="interest-tag">{pair.candidateSkill}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No signals at all */}
                  {!data.reasons?.length && !data.commonSkills?.length && !data.complementarySkills?.length && (
                    <p className="mb-no-data">Complete your profile to see detailed compatibility signals.</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
