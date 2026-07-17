/**
 * skillSimilarity
 *
 * Provides two skill-relationship queries backed by the DevGraph taxonomy:
 *
 *   areRelated(a, b)      — true if a and b are in the same domain
 *   areComplementary(a, b) — true if a and b pair well across domains
 *
 * Both functions accept raw or canonical skill names.
 */

const { _canonicalMap } = require("../data/skillTaxonomy");
const { normalizeSkill } = require("./normalizeSkill");

/**
 * Return the taxonomy entry for a skill (raw or canonical input).
 * Returns null if the skill is not in the taxonomy.
 */
const getEntry = (skill) => {
  const canonical = normalizeSkill(skill);
  return _canonicalMap.get(canonical) || null;
};

/**
 * True if skillA and skillB are related (same domain / ecosystem).
 * Relationship is bidirectional.
 */
const areRelated = (skillA, skillB) => {
  const canonA = normalizeSkill(skillA);
  const canonB = normalizeSkill(skillB);
  if (!canonA || !canonB || canonA === canonB) return false;

  const entryA = _canonicalMap.get(canonA);
  const entryB = _canonicalMap.get(canonB);
  if (!entryA || !entryB) return false;

  return (
    entryA.related.includes(canonB) ||
    entryB.related.includes(canonA)
  );
};

/**
 * True if skillA and skillB are complementary (cross-domain collaboration fit).
 * Relationship is bidirectional.
 */
const areComplementary = (skillA, skillB) => {
  const canonA = normalizeSkill(skillA);
  const canonB = normalizeSkill(skillB);
  if (!canonA || !canonB || canonA === canonB) return false;

  const entryA = _canonicalMap.get(canonA);
  const entryB = _canonicalMap.get(canonB);
  if (!entryA || !entryB) return false;

  return (
    entryA.complements.includes(canonB) ||
    entryB.complements.includes(canonA)
  );
};

/**
 * Return the category of a skill, or null if unknown.
 */
const getCategory = (skill) => {
  const entry = getEntry(skill);
  return entry ? entry.category : null;
};

module.exports = { areRelated, areComplementary, getCategory, getEntry };
