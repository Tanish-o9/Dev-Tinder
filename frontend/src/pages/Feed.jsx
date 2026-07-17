import { useState, useEffect, useCallback, useRef } from "react";
import UserCard from "../components/UserCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import OnboardingWizard from "../components/OnboardingWizard";
import { useAuth } from "../hooks/useAuth";
import { getFeed, searchDevelopers, saveDeveloper } from "../services/userApi";
import { sendInterested, sendIgnored } from "../services/requestApi";

const ROLES = ["Frontend Developer", "Backend Developer", "Full Stack Developer", "Mobile Developer", "AI/ML Engineer", "Data Scientist", "DevOps Engineer", "Cloud Engineer", "Cybersecurity Engineer", "UI/UX Developer", "Blockchain Developer"];
const INTERESTS = ["Hackathons", "Open Source", "Startup", "College Projects", "AI Projects", "Web Development", "Mobile Development", "Research"];
const QUICK_FILTERS = [
  { label: "Available", filter: { availability: "Available" } },
  { label: "Hackathon", filter: { interest: "Hackathons" } },
  { label: "Open Source", filter: { interest: "Open Source" } },
  { label: "AI/ML", filter: { role: "AI/ML Engineer" } },
  { label: "Frontend", filter: { role: "Frontend Developer" } },
  { label: "Backend", filter: { role: "Backend Developer" } },
];

const EMPTY_FILTERS = { skill: "", role: "", experience: "", interest: "", availability: "", location: "" };

// Determine why the feed is empty
const getEmptyState = (filters, searchQuery, users) => {
  if (searchQuery.trim()) return "SEARCH_NO_RESULTS";
  const hasFilters = Object.values(filters).some(Boolean);
  if (hasFilters) return "FILTERS_TOO_STRICT";
  if (users !== null && users.length === 0) return "ALL_PROCESSED";
  return "NO_DEVELOPERS";
};

export default function Feed() {
  const { user } = useAuth();

  // Feed state
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null); // null = not searching
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef(null);

  // Filter state
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeQuickFilter, setActiveQuickFilter] = useState(null);

  // Sort
  const [sort, setSort] = useState("best_match");

  const loadFeed = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const activeFilters = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const data = await getFeed(1, 60, activeFilters);
      let list = (data.data || []).filter((u) => u._id !== user?._id);

      if (sort === "complementary") {
        list = [...list].sort((a, b) =>
          (b.matchDimensions?.complementarySkills ?? 0) - (a.matchDimensions?.complementarySkills ?? 0)
        );
      } else if (sort === "similar") {
        list = [...list].sort((a, b) =>
          (b.matchDimensions?.directSkills ?? 0) - (a.matchDimensions?.directSkills ?? 0)
        );
      } else if (sort === "recent") {
        list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      // best_match is already sorted by backend

      setUsers(list);
      setCurrentIndex(0);
    } catch (err) {
      setError(err.message || "Unable to load feed");
    } finally {
      setLoading(false);
    }
  }, [user, filters, sort]);

  useEffect(() => {
    if (user) loadFeed();
  }, [user, loadFeed]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery.trim()) { setSearchResults(null); setSearchLoading(false); return; }
    setSearchLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchDevelopers(searchQuery.trim(), 1, 20);
        setSearchResults(data.data || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  const handleNext = () => setCurrentIndex((prev) => prev + 1);

  const handleInterested = async (userId) => {
    setActionLoading(true);
    try { await sendInterested(userId); handleNext(); }
    catch (err) { setError(err.message || "Failed to send request"); }
    finally { setActionLoading(false); }
  };

  const handleIgnored = async (userId) => {
    setActionLoading(true);
    try { await sendIgnored(userId); handleNext(); }
    catch (err) { setError(err.message || "Failed to ignore"); }
    finally { setActionLoading(false); }
  };

  const handleSave = async (userId) => {
    setActionLoading(true);
    try { await saveDeveloper(userId); }
    catch (err) { setError(err.message || "Could not save developer"); }
    finally { setActionLoading(false); }
  };

  const applyFilters = (e) => { e.preventDefault(); setFilters(draftFilters); setFiltersOpen(false); setActiveQuickFilter(null); };
  const clearFilters = () => { setDraftFilters(EMPTY_FILTERS); setFilters(EMPTY_FILTERS); setActiveQuickFilter(null); };

  const applyQuickFilter = (qf) => {
    if (activeQuickFilter === qf.label) { clearFilters(); return; }
    const next = { ...EMPTY_FILTERS, ...qf.filter };
    setFilters(next); setDraftFilters(next); setActiveQuickFilter(qf.label);
  };

  const hasActiveFilters = Object.values(filters).some(Boolean);

  // ── Render search mode ──────────────────────────────────────────────────────
  const renderSearchResults = () => {
    if (searchLoading) return (
      <div className="discover-search-state">
        <div className="spinner" />
        <p>Searching…</p>
      </div>
    );
    if (!searchResults?.length) return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <h3>No developers found for "{searchQuery}"</h3>
        <p>Try a different skill, role, or name.</p>
        <button className="btn btn-outline" onClick={() => setSearchQuery("")}>Clear Search</button>
      </div>
    );
    return (
      <div className="discover-search-grid">
        {searchResults.map((u) => (
          <UserCard key={u._id} user={u} onInterested={handleInterested} onIgnored={handleIgnored} onSave={handleSave} loading={actionLoading} />
        ))}
      </div>
    );
  };

  // ── Render empty feed states ────────────────────────────────────────────────
  const renderEmptyFeed = () => {
    const state = getEmptyState(filters, searchQuery, users);
    if (state === "FILTERS_TOO_STRICT") return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
        </div>
        <h3>No developers match your current filters</h3>
        <p>Try broadening your search or clearing some filters.</p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
          <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
          <button className="btn btn-outline" onClick={() => setFiltersOpen(true)}>Adjust Filters</button>
        </div>
      </div>
    );
    if (state === "ALL_PROCESSED") return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h3>You've explored all available developers</h3>
        <p>Check back later as new developers join the community.</p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
          <button className="btn btn-primary" onClick={loadFeed}>Refresh</button>
        </div>
      </div>
    );
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <h3>No developers to discover right now</h3>
        <p>New developers are joining every day. Check back soon.</p>
        <button className="btn btn-outline" onClick={loadFeed}>Refresh</button>
      </div>
    );
  };

  const showWizard = !loading && (user?.profileCompletion ?? 100) < 40 && !sessionStorage.getItem("wizardDismissed");

  if (loading) return <LoadingSpinner fullPage />;

  const isSearching = searchQuery.trim().length > 0;
  const currentUser = !isSearching ? users[currentIndex] : null;
  const feedDone = !isSearching && (currentIndex >= users.length || users.length === 0);

  return (
    <div className="page-container discover-page">
      {showWizard && (
        <OnboardingWizard onComplete={() => { sessionStorage.setItem("wizardDismissed", "1"); loadFeed(); }} />
      )}
      {/* Header */}
      <div className="page-header">
        <h1>Discover Developers</h1>
        <p className="page-subtitle">Find developers based on skills, technical compatibility, and collaboration goals.</p>
      </div>

      {/* Search bar */}
      <div className="discover-search-bar">
        <svg className="discover-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="search"
          className="discover-search-input"
          placeholder="Search developers, skills, roles…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search developers"
        />
        {searchQuery && (
          <button className="discover-search-clear" onClick={() => setSearchQuery("")} aria-label="Clear search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Quick filter chips — only shown when not searching */}
      {!isSearching && (
        <div className="discover-quick-filters">
          {QUICK_FILTERS.map((qf) => (
            <button
              key={qf.label}
              className={`discover-chip${activeQuickFilter === qf.label ? " discover-chip--active" : ""}`}
              onClick={() => applyQuickFilter(qf)}
            >
              {qf.label}
            </button>
          ))}
          <button
            className={`discover-chip${filtersOpen ? " discover-chip--active" : ""}`}
            onClick={() => setFiltersOpen((v) => !v)}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filters{hasActiveFilters ? " ●" : ""}
          </button>
        </div>
      )}

      {/* Advanced filters panel */}
      {filtersOpen && !isSearching && (
        <form className="feed-filters discover-filters" onSubmit={applyFilters}>
          <input placeholder="Skill, e.g. React" value={draftFilters.skill} onChange={(e) => setDraftFilters({ ...draftFilters, skill: e.target.value })} />
          <select value={draftFilters.role} onChange={(e) => setDraftFilters({ ...draftFilters, role: e.target.value })}>
            <option value="">Any role</option>
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
          <select value={draftFilters.experience} onChange={(e) => setDraftFilters({ ...draftFilters, experience: e.target.value })}>
            <option value="">Any experience</option>
            {["Beginner", "Intermediate", "Advanced"].map((l) => <option key={l}>{l}</option>)}
          </select>
          <select value={draftFilters.interest} onChange={(e) => setDraftFilters({ ...draftFilters, interest: e.target.value })}>
            <option value="">Any interest</option>
            {INTERESTS.map((i) => <option key={i}>{i}</option>)}
          </select>
          <select value={draftFilters.availability} onChange={(e) => setDraftFilters({ ...draftFilters, availability: e.target.value })}>
            <option value="">Any availability</option>
            {["Available", "Open to Opportunities", "Busy"].map((o) => <option key={o}>{o}</option>)}
          </select>
          <input placeholder="Location" value={draftFilters.location} onChange={(e) => setDraftFilters({ ...draftFilters, location: e.target.value })} />
          <div>
            <button className="btn btn-primary" type="submit">Apply</button>
            <button className="btn btn-ghost" type="button" onClick={clearFilters}>Clear</button>
          </div>
        </form>
      )}

      {/* Sort + counter row — only in feed mode */}
      {!isSearching && !feedDone && (
        <div className="discover-sort-row">
          <span className="discover-count">{users.length - currentIndex} developer{users.length - currentIndex !== 1 ? "s" : ""} remaining</span>
          <select className="discover-sort-select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort developers">
            <option value="best_match">Best Match</option>
            <option value="complementary">Most Complementary</option>
            <option value="similar">Most Similar</option>
            <option value="recent">Recently Joined</option>
          </select>
        </div>
      )}

      {error && <ErrorMessage message={error} onRetry={loadFeed} />}

      {/* Search results */}
      {isSearching && renderSearchResults()}

      {/* Feed card */}
      {!isSearching && !feedDone && currentUser && (
        <div className="feed-card-wrapper">
          <UserCard
            key={currentUser._id}
            user={currentUser}
            onInterested={handleInterested}
            onIgnored={handleIgnored}
            onSave={handleSave}
            loading={actionLoading}
          />
          <p className="feed-counter">{currentIndex + 1} of {users.length}</p>
        </div>
      )}

      {/* Empty feed state */}
      {!isSearching && feedDone && renderEmptyFeed()}
    </div>
  );
}
