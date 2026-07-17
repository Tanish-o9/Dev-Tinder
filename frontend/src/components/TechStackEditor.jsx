import { useCallback, useEffect, useRef, useState } from "react";
import { getSkillTaxonomy } from "../services/userApi";

const MAX_SKILLS = 30;
let _taxonomyCache = null;

export default function TechStackEditor({ skills = [], onChange, disabled = false }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [taxonomy, setTaxonomy] = useState([]);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (_taxonomyCache) { setTaxonomy(_taxonomyCache); return; }
    getSkillTaxonomy()
      .then((res) => { _taxonomyCache = res.data || []; setTaxonomy(_taxonomyCache); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!query.trim()) { setSuggestions([]); return; }
    const q = query.toLowerCase();
    const currentSet = new Set(skills.map((s) => s.toLowerCase()));
    const matches = taxonomy
      .filter((entry) => {
        if (currentSet.has(entry.canonical.toLowerCase())) return false;
        return (
          entry.canonical.toLowerCase().includes(q) ||
          entry.aliases.some((a) => a.includes(q))
        );
      })
      .slice(0, 8);
    setSuggestions(matches);
  }, [query, taxonomy, skills]);

  const addSkill = useCallback((skill) => {
    const trimmed = skill.trim();
    if (!trimmed || skills.length >= MAX_SKILLS) return;
    if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) return;
    onChange([...skills, trimmed]);
    setQuery("");
    setSuggestions([]);
    inputRef.current?.focus();
  }, [skills, onChange]);

  const removeSkill = useCallback((skill) => {
    onChange(skills.filter((s) => s !== skill));
  }, [skills, onChange]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions.length > 0) addSkill(suggestions[0].canonical);
      else if (query.trim()) addSkill(query.trim());
    }
    if (e.key === "Escape") { setSuggestions([]); setQuery(""); }
    if (e.key === "Backspace" && !query && skills.length > 0) removeSkill(skills[skills.length - 1]);
  };

  useEffect(() => {
    const handler = (e) => {
      if (listRef.current && !listRef.current.contains(e.target) && e.target !== inputRef.current)
        setSuggestions([]);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const atLimit = skills.length >= MAX_SKILLS;

  return (
    <div className={`tse-wrapper${focused ? " tse-focused" : ""}${disabled ? " tse-disabled" : ""}`}>
      {skills.length > 0 && (
        <div className="tse-selected">
          {skills.map((skill) => (
            <span key={skill} className="tse-chip">
              {skill}
              {!disabled && (
                <button type="button" className="tse-chip-remove" onClick={() => removeSkill(skill)} aria-label={`Remove ${skill}`}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {!disabled && (
        <div className="tse-input-row">
          <input
            ref={inputRef}
            type="text"
            className="tse-input"
            placeholder={atLimit ? `Maximum ${MAX_SKILLS} skills reached` : "Search or type a skill…"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled || atLimit}
            autoComplete="off"
            aria-label="Add skill"
          />
          {query.trim() && !atLimit && (
            <button type="button" className="btn btn-outline tse-add-btn"
              onClick={() => suggestions.length > 0 ? addSkill(suggestions[0].canonical) : addSkill(query.trim())}>
              Add
            </button>
          )}
        </div>
      )}

      {suggestions.length > 0 && (
        <ul className="tse-suggestions" ref={listRef} role="listbox">
          {suggestions.map((entry) => (
            <li key={entry.canonical} role="option">
              <button type="button" className="tse-suggestion-item"
                onMouseDown={(e) => { e.preventDefault(); addSkill(entry.canonical); }}>
                <span className="tse-suggestion-name">{entry.canonical}</span>
                <span className="tse-suggestion-cat">{entry.category}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="tse-hint">{skills.length}/{MAX_SKILLS} · Enter to add · Backspace to remove last</p>
    </div>
  );
}
