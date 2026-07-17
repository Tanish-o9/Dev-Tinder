/**
 * githubService.js
 *
 * Fetches public GitHub profile data with a simple in-memory TTL cache.
 * Cache TTL: 10 minutes — balances freshness against the 60 req/hr
 * unauthenticated GitHub API rate limit.
 */

const usernamePattern = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

// ── In-memory cache ───────────────────────────────────────────────────────────
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const _cache = new Map(); // username.toLowerCase() → { data, expiresAt }

const getCached = (username) => {
  const entry = _cache.get(username.toLowerCase());
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    _cache.delete(username.toLowerCase());
    return null;
  }
  return entry.data;
};

const setCache = (username, data) => {
  _cache.set(username.toLowerCase(), { data, expiresAt: Date.now() + CACHE_TTL_MS });
};

// ── helpers ───────────────────────────────────────────────────────────────────

const getRepositoryLanguageDistribution = (repositories) => {
  const counts = repositories.reduce((totals, repository) => {
    if (repository.language) totals[repository.language] = (totals[repository.language] || 0) + 1;
    return totals;
  }, {});
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  if (!total) return [];
  return Object.entries(counts)
    .map(([language, count]) => ({
      language,
      percentage: Math.round((count / total) * 100),
      repositoryCount: count,
    }))
    .sort((a, b) => b.repositoryCount - a.repositoryCount || a.language.localeCompare(b.language));
};

// ── main fetch ────────────────────────────────────────────────────────────────

const getPublicGithubProfile = async (username) => {
  if (!usernamePattern.test(username)) {
    const error = new Error("Invalid GitHub username");
    error.status = 400;
    throw error;
  }

  const cached = getCached(username);
  if (cached) return cached;

  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "DevTinder",
  };
  const encodedUsername = encodeURIComponent(username);

  const [profileResponse, reposResponse] = await Promise.all([
    fetch(`https://api.github.com/users/${encodedUsername}`, { headers }),
    fetch(`https://api.github.com/users/${encodedUsername}/repos?per_page=100&sort=updated`, { headers }),
  ]);

  if (!profileResponse.ok) {
    const error = new Error(
      profileResponse.status === 403
        ? "GitHub API rate limit reached. Please try again later."
        : "GitHub profile is unavailable"
    );
    error.status = profileResponse.status === 404 ? 404 : profileResponse.status === 403 ? 429 : 502;
    throw error;
  }

  const profile = await profileResponse.json();
  const repos = reposResponse.ok ? await reposResponse.json() : [];

  if (!reposResponse.ok && reposResponse.status === 403) {
    const error = new Error("GitHub API rate limit reached. Please try again later.");
    error.status = 429;
    throw error;
  }

  const result = {
    profile: {
      login: profile.login,
      name: profile.name,
      avatarUrl: profile.avatar_url,
      bio: profile.bio,
      publicRepos: profile.public_repos,
      followers: profile.followers,
      following: profile.following,
      htmlUrl: profile.html_url,
    },
    languageMetric: "Repository Language Distribution",
    topLanguages: getRepositoryLanguageDistribution(repos),
    repositories: repos
      .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
      .slice(0, 6)
      .map((repo) => ({
        name: repo.name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        url: repo.html_url,
      })),
  };

  setCache(username, result);
  return result;
};

module.exports = { getPublicGithubProfile, getRepositoryLanguageDistribution };
