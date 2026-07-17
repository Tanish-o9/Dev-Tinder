const { normalizeSkills } = require("./normalizeSkill");
const { areRelated, areComplementary } = require("./skillSimilarity");

const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)));
const norm = (v) => String(v || "").trim().toLowerCase();

const ROLE_SKILL_MAP = {
  "frontend developer": ["React", "Vue.js", "Angular", "Next.js", "TypeScript", "JavaScript", "HTML", "CSS"],
  "backend developer": ["Node.js", "Express", "Django", "FastAPI", "Spring Boot", "PostgreSQL", "MongoDB", "REST API"],
  "full stack developer": ["React", "Node.js", "MongoDB", "PostgreSQL", "TypeScript", "JavaScript"],
  "ai/ml engineer": ["Python", "TensorFlow", "PyTorch", "Machine Learning", "Scikit-learn", "LangChain"],
  "data scientist": ["Python", "Pandas", "NumPy", "Scikit-learn", "SQL", "Data Science"],
  "devops engineer": ["Docker", "Kubernetes", "CI/CD", "AWS", "Terraform", "Linux"],
  "mobile developer": ["React Native", "Flutter", "Android", "iOS", "Kotlin", "Swift"],
  "blockchain developer": ["Solidity", "Web3", "Ethereum", "Smart Contracts"],
  "cloud engineer": ["AWS", "Google Cloud", "Azure", "Terraform", "Docker", "Kubernetes"],
};

/**
 * Taxonomy-aware project match score.
 *
 * Dimensions:
 *   Direct skill overlap     50%
 *   Related skill coverage   25%
 *   Complementary coverage   15%
 *   Role alignment           10%
 */
const getProjectMatch = (developer, project) => {
  const devSkills = normalizeSkills(developer?.skills || []);
  const reqSkills = normalizeSkills(project?.requiredSkills || []);

  if (!reqSkills.length) return { score: 0, matchingSkills: [], relatedSkills: [], complementarySkills: [] };

  const devSet = new Set(devSkills);
  const reqSet = new Set(reqSkills);

  // Direct matches
  const directMatches = reqSkills.filter((s) => devSet.has(s));
  const directScore = clamp((directMatches.length / reqSkills.length) * 100);

  // Related: dev has a skill related to a required skill (not already direct)
  const relatedMatches = [];
  for (const req of reqSkills) {
    if (devSet.has(req)) continue;
    for (const dev of devSkills) {
      if (areRelated(dev, req) && !relatedMatches.includes(req)) {
        relatedMatches.push(req);
        break;
      }
    }
  }
  const relatedScore = clamp((relatedMatches.length / reqSkills.length) * 100);

  // Complementary: dev has a skill that complements a required skill
  const complementaryMatches = [];
  for (const req of reqSkills) {
    if (devSet.has(req)) continue;
    for (const dev of devSkills) {
      if (areComplementary(dev, req) && !complementaryMatches.includes(req)) {
        complementaryMatches.push(req);
        break;
      }
    }
  }
  const complementaryScore = clamp((complementaryMatches.length / reqSkills.length) * 100);

  // Role alignment: check if developer's role maps to required skills
  let roleScore = 0;
  const devRole = norm(developer?.developerRole);
  const roleSkills = ROLE_SKILL_MAP[devRole] || [];
  if (roleSkills.length) {
    const roleHits = roleSkills.filter((s) => reqSet.has(s));
    roleScore = clamp((roleHits.length / Math.min(roleSkills.length, reqSkills.length)) * 100);
  }

  // Also check openRoles if project has them
  let openRoleBonus = 0;
  if (project?.openRoles?.length && devRole) {
    const roleMatch = project.openRoles.some((r) => norm(r.role) === devRole);
    if (roleMatch) openRoleBonus = 10;
  }

  const score = clamp(
    directScore * 0.50 +
    relatedScore * 0.25 +
    complementaryScore * 0.15 +
    roleScore * 0.10 +
    openRoleBonus
  );

  // Display: use original casing from project.requiredSkills
  const toDisplay = (normalized) =>
    (project.requiredSkills || []).find((r) => norm(r) === norm(normalized)) || normalized;

  return {
    score,
    matchingSkills: directMatches.map(toDisplay),
    relatedSkills: relatedMatches.map(toDisplay),
    complementarySkills: complementaryMatches.map(toDisplay),
  };
};

module.exports = { getProjectMatch };
