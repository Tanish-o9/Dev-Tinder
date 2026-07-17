import { useEffect, useState } from "react";
import { getGithubProfile } from "../services/githubApi";

export default function GithubProfile({ username }) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | error

  useEffect(() => {
    if (!username) return;
    let active = true;
    setStatus("loading");
    setData(null);
    getGithubProfile(username)
      .then((res) => { if (active) { setData(res.data); setStatus("done"); } })
      .catch(() => { if (active) setStatus("error"); });
    return () => { active = false; };
  }, [username]);

  if (!username) {
    return (
      <div className="github-unavailable">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
        </svg>
        <p>No GitHub username added yet.</p>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="github-unavailable">
        <p className="page-subtitle">Loading GitHub profile…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="github-unavailable">
        <p>GitHub profile could not be loaded.</p>
      </div>
    );
  }

  if (!data) return null;

  const { profile, topLanguages, repositories, languageMetric } = data;

  return (
    <section className="github-section">
      {/* Header */}
      <div className="github-header">
        <img
          className="github-avatar"
          src={profile.avatarUrl}
          alt={`${profile.login} avatar`}
          width="64"
          height="64"
        />
        <div className="github-identity">
          <a
            className="github-username"
            href={profile.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            @{profile.login}
          </a>
          {profile.bio && <p className="github-bio">{profile.bio}</p>}
        </div>
      </div>

      {/* Stats */}
      <div className="github-stats">
        <div className="github-stat">
          <span className="github-stat-value">{profile.publicRepos}</span>
          <span className="github-stat-label">Repositories</span>
        </div>
        <div className="github-stat">
          <span className="github-stat-value">{profile.followers}</span>
          <span className="github-stat-label">Followers</span>
        </div>
        <div className="github-stat">
          <span className="github-stat-value">{profile.following}</span>
          <span className="github-stat-label">Following</span>
        </div>
      </div>

      {/* Top Languages */}
      {topLanguages?.length > 0 && (
        <div className="github-languages">
          <p className="github-section-label">{languageMetric}</p>
          <div className="github-lang-bar">
            {topLanguages.map((item) => (
              <div
                key={item.language}
                className="github-lang-segment"
                style={{ width: `${item.percentage}%` }}
                title={`${item.language} ${item.percentage}%`}
              />
            ))}
          </div>
          <div className="github-lang-legend">
            {topLanguages.map((item) => (
              <span key={item.language} className="github-lang-item">
                <span className="github-lang-dot" />
                {item.language} <span className="github-lang-pct">{item.percentage}%</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Popular Repositories */}
      {repositories?.length > 0 && (
        <div className="github-repos">
          <p className="github-section-label">Popular Repositories</p>
          <div className="github-repos-grid">
            {repositories.map((repo) => (
              <a
                key={repo.url}
                className="github-repo-card"
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="github-repo-top">
                  <span className="github-repo-name">{repo.name}</span>
                  {repo.language && (
                    <span className="interest-tag">{repo.language}</span>
                  )}
                </div>
                {repo.description && (
                  <p className="github-repo-desc">{repo.description}</p>
                )}
                <div className="github-repo-meta">
                  <span title="Stars">★ {repo.stars}</span>
                  <span title="Forks">⑂ {repo.forks}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
