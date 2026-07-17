/**
 * normalizeSkill
 *
 * Converts a raw user-entered skill string to its canonical form
 * using the DevGraph taxonomy alias map.
 *
 * If no match is found the input is returned title-cased and trimmed
 * so it still displays cleanly without being silently dropped.
 *
 * Examples:
 *   "js"        → "JavaScript"
 *   "nodejs"    → "Node.js"
 *   "reactjs"   → "React"
 *   "pytorch"   → "PyTorch"
 *   "MyLib"     → "MyLib"   (unknown skill — preserved as-is)
 */

const { _aliasMap } = require("../data/skillTaxonomy");

/**
 * Normalize a single skill string.
 * @param {string} skill
 * @returns {string} canonical name or cleaned original
 */
const normalizeSkill = (skill) => {
  if (typeof skill !== "string") return "";
  const trimmed = skill.trim();
  if (!trimmed) return "";
  const canonical = _aliasMap.get(trimmed.toLowerCase());
  if (canonical) return canonical;
  // Unknown skill — return trimmed with first letter uppercased.
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

/**
 * Normalize an array of skills, deduplicate by canonical name.
 * Does NOT mutate the original array.
 * @param {string[]} skills
 * @returns {string[]}
 */
const normalizeSkills = (skills) => {
  if (!Array.isArray(skills)) return [];
  const seen = new Set();
  const result = [];
  for (const skill of skills) {
    const normalized = normalizeSkill(skill);
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(normalized);
    }
  }
  return result;
};

module.exports = { normalizeSkill, normalizeSkills };
