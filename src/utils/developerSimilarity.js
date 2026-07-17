/**
 * developerSimilarity — Advanced Developer Compatibility Engine
 *
 * Replaces the old flat matchScore.js with a multi-dimensional
 * compatibility analysis backed by the DevGraph skill taxonomy.
 *
 * Dimensions and weights:
 *   Direct Skill Overlap        25%
 *   Related Skill Similarity    15%
 *   Complementary Skills        15%
 *   Collaboration Interests     15%
 *   Role Compatibility          10%
 *   Experience Compatibility    10%
 *   Availability                 5%
 *   Project Relevance            5%
 *                              ────
 *                              100%
 */

const { normalizeSkill, normalizeSkills } = require("./normalizeSkill");
const { areRelated, areComplementary } = require("./skillSimilarity");

// ── helpers ──────────────────────────────────────────────────────────────────

const norm = (v) => String(v || "").trim().toLowerCase();

const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)));

/**
 * Deduplicate and normalize a skills array.
 * Returns canonical names.
 */
const prepSkills = (skills) => normalizeSkills(Array.isArray(skills) ? skills : []);

/**
 * Deduplicate and lowercase an interests array.
 */
const prepInterests = (interests) =>
  [...new Set((Array.isArray(interests) ? interests : []).map(norm).filter(Boolean))];

// ── role compatibility map ────────────────────────────────────────────────────
// Pairs of roles that complement each other for collaboration.
const COMPLEMENTARY_ROLES = new Set([
  "frontend developer|backend developer",
  "frontend developer|full stack developer",
  "backend developer|full stack developer",
  "frontend developer|devops engineer",
  "backend developer|devops engineer",
  "full stack developer|devops engineer",
  "frontend developer|ui/ux developer",
  "ai/ml engineer|backend developer",
  "ai/ml engineer|full stack developer",
  "data scientist|backend developer",
  "data scientist|full stack developer",
  "mobile developer|backend developer",
  "mobile developer|full stack developer",
  "blockchain developer|backend developer",
  "blockchain developer|full stack developer",
  "cloud engineer|backend developer",
  "cloud engineer|devops engineer",
  "cybersecurity engineer|devops engineer",
  "cybersecurity engineer|backend developer",
]);

const rolesAreComplementary = (roleA, roleB) => {
  const a = norm(roleA);
  const b = norm(roleB);
  return (
    COMPLEMENTARY_ROLES.has(`${a}|${b}`) ||
    COMPLEMENTARY_ROLES.has(`${b}|${a}`)
  );
};

// ── experience compatibility ──────────────────────────────────────────────────
const EXPERIENCE_RANK = { beginner: 0, intermediate: 1, advanced: 2 };

const experienceScore = (levelA, levelB) => {
  const a = EXPERIENCE_RANK[norm(levelA)];
  const b = EXPERIENCE_RANK[norm(levelB)];
  if (a === undefined || b === undefined) return 50; // incomplete data → neutral
  const diff = Math.abs(a - b);
  if (diff === 0) return 100;
  if (diff === 1) return 60;
  return 20;
};

// ── dimension calculators ─────────────────────────────────────────────────────

/**
 * Direct skill overlap score (0-100).
 * Jaccard-style: intersection / union.
 */
const directSkillScore = (viewerSkills, candidateSkills) => {
  if (!viewerSkills.length || !candidateSkills.length) return 0;
  const vSet = new Set(viewerSkills);
  const cSet = new Set(candidateSkills);
  const intersection = viewerSkills.filter((s) => cSet.has(s));
  const union = new Set([...vSet, ...cSet]);
  return clamp((intersection.length / union.size) * 100);
};

/**
 * Related skill score (0-100).
 * Counts viewer→candidate pairs where skills are related in the taxonomy.
 */
const relatedSkillScore = (viewerSkills, candidateSkills) => {
  if (!viewerSkills.length || !candidateSkills.length) return 0;
  let hits = 0;
  const pairs = viewerSkills.length * candidateSkills.length;
  for (const vs of viewerSkills) {
    for (const cs of candidateSkills) {
      if (areRelated(vs, cs)) hits++;
    }
  }
  return clamp((hits / pairs) * 100);
};

/**
 * Complementary skill score (0-100).
 * Counts viewer→candidate pairs where skills complement each other.
 */
const complementarySkillScore = (viewerSkills, candidateSkills) => {
  if (!viewerSkills.length || !candidateSkills.length) return 0;
  let hits = 0;
  const pairs = viewerSkills.length * candidateSkills.length;
  for (const vs of viewerSkills) {
    for (const cs of candidateSkills) {
      if (areComplementary(vs, cs)) hits++;
    }
  }
  return clamp((hits / pairs) * 100);
};

/**
 * Collaboration interest overlap score (0-100).
 */
const interestScore = (viewerInterests, candidateInterests) => {
  if (!viewerInterests.length || !candidateInterests.length) return 0;
  const cSet = new Set(candidateInterests);
  const common = viewerInterests.filter((i) => cSet.has(i));
  const union = new Set([...viewerInterests, ...candidateInterests]);
  return clamp((common.length / union.size) * 100);
};

/**
 * Role compatibility score (0-100).
 */
const roleScore = (viewerRole, candidateRole) => {
  const vr = norm(viewerRole);
  const cr = norm(candidateRole);
  if (!vr || !cr || vr === "other" || cr === "other") return 50;
  if (vr === cr) return 100;
  if (rolesAreComplementary(vr, cr)) return 85;
  return 30;
};

/**
 * Availability score (0-100).
 */
const availabilityScore = (viewerAvail, candidateAvail) => {
  const va = norm(viewerAvail);
  const ca = norm(candidateAvail);
  if (ca === "available") return 100;
  if (ca === "open to opportunities") return 70;
  if (ca === "busy") return 20;
  return 50;
};

// ── reason builders ───────────────────────────────────────────────────────────

const buildReasons = ({
  commonSkills,
  relatedPairs,
  complementaryPairs,
  commonInterests,
  viewerRole,
  candidateRole,
  viewerExp,
  candidateExp,
}) => {
  const reasons = [];

  if (commonSkills.length) {
    const listed = commonSkills.slice(0, 2).join(" and ");
    reasons.push(`You both work with ${listed}`);
  }

  if (complementaryPairs.length) {
    const pair = complementaryPairs[0];
    reasons.push(`Your ${pair.viewerSkill} experience complements their ${pair.candidateSkill} skills`);
  }

  if (relatedPairs.length && !commonSkills.length) {
    const pair = relatedPairs[0];
    reasons.push(`Your ${pair.viewerSkill} and their ${pair.candidateSkill} are in the same technical domain`);
  }

  if (commonInterests.length) {
    reasons.push(`You share an interest in ${commonInterests[0]}`);
  }

  const vr = norm(viewerRole);
  const cr = norm(candidateRole);
  if (vr && cr && vr !== "other" && cr !== "other") {
    if (vr === cr) {
      reasons.push(`You are both ${candidateRole}s`);
    } else if (rolesAreComplementary(vr, cr)) {
      reasons.push(`Your developer roles complement each other`);
    }
  }

  const expDiff = Math.abs(
    (EXPERIENCE_RANK[norm(viewerExp)] ?? 1) - (EXPERIENCE_RANK[norm(candidateExp)] ?? 1)
  );
  if (expDiff === 0 && viewerExp) {
    reasons.push(`You are both at the ${candidateExp} level`);
  } else if (expDiff === 1) {
    reasons.push(`Your experience levels are compatible`);
  }

  return reasons.slice(0, 4);
};

// ── main export ───────────────────────────────────────────────────────────────

/**
 * Compute a full compatibility breakdown between two developer profiles.
 *
 * @param {object} viewer    — the logged-in user's profile
 * @param {object} candidate — the developer being evaluated
 * @returns {object} compatibility result
 */
const getDeveloperCompatibility = (viewer, candidate) => {
  const viewerSkills = prepSkills(viewer?.skills);
  const candidateSkills = prepSkills(candidate?.skills);
  const viewerInterests = prepInterests(viewer?.collaborationInterests);
  const candidateInterests = prepInterests(candidate?.collaborationInterests);

  // ── dimension scores ──────────────────────────────────────────────────────
  const directScore = directSkillScore(viewerSkills, candidateSkills);
  const relatedScore = relatedSkillScore(viewerSkills, candidateSkills);
  const compScore = complementarySkillScore(viewerSkills, candidateSkills);
  const intScore = interestScore(viewerInterests, candidateInterests);
  const roleS = roleScore(viewer?.developerRole, candidate?.developerRole);
  const expS = experienceScore(viewer?.experienceLevel, candidate?.experienceLevel);
  const availS = availabilityScore(viewer?.availability, candidate?.availability);

  // Project relevance: placeholder 50 (will be enriched in Phase J)
  const projS = 50;

  // ── weighted overall score ────────────────────────────────────────────────
  const overall = clamp(
    directScore * 0.25 +
    relatedScore * 0.15 +
    compScore * 0.15 +
    intScore * 0.15 +
    roleS * 0.10 +
    expS * 0.10 +
    availS * 0.05 +
    projS * 0.05
  );

  // ── common skills (display names from candidate's raw skills) ─────────────
  const cSet = new Set(candidateSkills);
  const commonSkills = viewerSkills
    .filter((s) => cSet.has(s))
    .map((s) => {
      // Prefer the candidate's original casing if available
      const raw = (candidate?.skills || []).find(
        (r) => normalizeSkill(r) === s
      );
      return raw || s;
    });

  // ── related pairs ─────────────────────────────────────────────────────────
  const relatedPairs = [];
  for (const vs of viewerSkills) {
    for (const cs of candidateSkills) {
      if (areRelated(vs, cs) && vs !== cs) {
        relatedPairs.push({ viewerSkill: vs, candidateSkill: cs });
      }
    }
  }

  // ── complementary pairs ───────────────────────────────────────────────────
  const complementaryPairs = [];
  for (const vs of viewerSkills) {
    for (const cs of candidateSkills) {
      if (areComplementary(vs, cs)) {
        complementaryPairs.push({ viewerSkill: vs, candidateSkill: cs });
      }
    }
  }

  // ── common interests (display names) ─────────────────────────────────────
  const ciSet = new Set(candidateInterests);
  const commonInterests = viewerInterests
    .filter((i) => ciSet.has(i))
    .map((i) => {
      const raw = (candidate?.collaborationInterests || []).find(
        (r) => norm(r) === i
      );
      return raw || i;
    });

  // ── reasons ───────────────────────────────────────────────────────────────
  const reasons = buildReasons({
    commonSkills,
    relatedPairs,
    complementaryPairs,
    commonInterests,
    viewerRole: viewer?.developerRole,
    candidateRole: candidate?.developerRole,
    viewerExp: viewer?.experienceLevel,
    candidateExp: candidate?.experienceLevel,
  });

  return {
    overallScore: overall,
    dimensions: {
      directSkills: directScore,
      relatedSkills: relatedScore,
      complementarySkills: compScore,
      collaborationInterests: intScore,
      roleCompatibility: roleS,
      experienceCompatibility: expS,
      availability: availS,
      projectRelevance: projS,
    },
    commonSkills,
    relatedSkills: relatedPairs.slice(0, 5),
    complementarySkills: complementaryPairs.slice(0, 5),
    commonInterests,
    reasons,
  };
};

module.exports = { getDeveloperCompatibility };
