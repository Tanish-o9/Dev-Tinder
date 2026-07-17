/**
 * matchScore.js — compatibility adapter
 *
 * Wraps the advanced developerSimilarity engine and exposes the same
 * { score, reasons, commonSkills } shape that existing routes expect,
 * while also attaching the full breakdown for new consumers.
 */

const { getDeveloperCompatibility } = require("./developerSimilarity");

/**
 * @param {object} viewer    — logged-in user profile
 * @param {object} candidate — developer being evaluated
 * @returns {{ score, reasons, commonSkills, dimensions, complementarySkills, relatedSkills }}
 */
const getMatchScore = (viewer, candidate) => {
  const result = getDeveloperCompatibility(viewer, candidate);
  return {
    // Legacy shape — used by existing feed/saved routes
    score: result.overallScore,
    reasons: result.reasons,
    commonSkills: result.commonSkills,
    // Extended shape — available for new match breakdown API
    dimensions: result.dimensions,
    relatedSkills: result.relatedSkills,
    complementarySkills: result.complementarySkills,
    commonInterests: result.commonInterests,
  };
};

module.exports = { getMatchScore };
