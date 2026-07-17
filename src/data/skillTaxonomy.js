/**
 * DevGraph Skill Taxonomy
 *
 * Each entry defines:
 *   canonical   — the display name used throughout the platform
 *   aliases     — alternate spellings/abbreviations that map to this skill
 *   category    — skill grouping used for profile display and matching
 *   related     — skills in the same domain (similar, not complementary)
 *   complements — skills from other domains that pair well for collaboration
 */

const TAXONOMY = [
  // ── Languages ──────────────────────────────────────────────────────────────
  {
    canonical: "JavaScript",
    aliases: ["javascript", "js", "ecmascript", "es6", "es2015", "vanilla js", "vanillajs"],
    category: "Language",
    related: ["TypeScript", "Node.js"],
    complements: ["Python", "Go", "Rust"],
  },
  {
    canonical: "TypeScript",
    aliases: ["typescript", "ts"],
    category: "Language",
    related: ["JavaScript", "Node.js"],
    complements: ["Python", "Go"],
  },
  {
    canonical: "Python",
    aliases: ["python", "python3", "py"],
    category: "Language",
    related: ["Django", "Flask", "FastAPI", "PyTorch", "TensorFlow", "NumPy", "Pandas"],
    complements: ["JavaScript", "TypeScript", "Go", "Rust"],
  },
  {
    canonical: "Java",
    aliases: ["java"],
    category: "Language",
    related: ["Spring Boot", "Kotlin"],
    complements: ["JavaScript", "TypeScript", "Python"],
  },
  {
    canonical: "Kotlin",
    aliases: ["kotlin"],
    category: "Language",
    related: ["Java", "Android"],
    complements: ["Swift", "JavaScript"],
  },
  {
    canonical: "Swift",
    aliases: ["swift"],
    category: "Language",
    related: ["iOS", "Xcode"],
    complements: ["Kotlin", "JavaScript"],
  },
  {
    canonical: "Go",
    aliases: ["go", "golang"],
    category: "Language",
    related: ["Docker", "Kubernetes"],
    complements: ["JavaScript", "TypeScript", "Python"],
  },
  {
    canonical: "Rust",
    aliases: ["rust", "rust-lang"],
    category: "Language",
    related: ["WebAssembly", "C++"],
    complements: ["JavaScript", "Python", "Go"],
  },
  {
    canonical: "C++",
    aliases: ["c++", "cpp", "c plus plus"],
    category: "Language",
    related: ["C", "Rust"],
    complements: ["Python", "JavaScript"],
  },
  {
    canonical: "C",
    aliases: ["c language"],
    category: "Language",
    related: ["C++"],
    complements: ["Python", "JavaScript"],
  },
  {
    canonical: "PHP",
    aliases: ["php"],
    category: "Language",
    related: ["Laravel", "MySQL"],
    complements: ["JavaScript", "TypeScript"],
  },
  {
    canonical: "Ruby",
    aliases: ["ruby", "rb"],
    category: "Language",
    related: ["Ruby on Rails"],
    complements: ["JavaScript", "TypeScript"],
  },
  {
    canonical: "Dart",
    aliases: ["dart"],
    category: "Language",
    related: ["Flutter"],
    complements: ["JavaScript", "Kotlin", "Swift"],
  },
  {
    canonical: "Solidity",
    aliases: ["solidity"],
    category: "Language",
    related: ["Ethereum", "Web3", "Smart Contracts"],
    complements: ["JavaScript", "TypeScript"],
  },
  {
    canonical: "R",
    aliases: ["r language", "rlang"],
    category: "Language",
    related: ["Data Science", "Python"],
    complements: ["Python", "SQL"],
  },

  // ── Frontend ───────────────────────────────────────────────────────────────
  {
    canonical: "React",
    aliases: ["react", "reactjs", "react.js", "react js"],
    category: "Frontend",
    related: ["JavaScript", "TypeScript", "Next.js", "Redux"],
    complements: ["Node.js", "Express", "Django", "FastAPI"],
  },
  {
    canonical: "Next.js",
    aliases: ["next.js", "nextjs", "next js"],
    category: "Frontend",
    related: ["React", "TypeScript"],
    complements: ["Node.js", "PostgreSQL", "MongoDB"],
  },
  {
    canonical: "Vue.js",
    aliases: ["vue", "vuejs", "vue.js", "vue js"],
    category: "Frontend",
    related: ["JavaScript", "TypeScript", "Nuxt.js"],
    complements: ["Node.js", "Express", "Django"],
  },
  {
    canonical: "Angular",
    aliases: ["angular", "angularjs"],
    category: "Frontend",
    related: ["TypeScript", "RxJS"],
    complements: ["Node.js", "Spring Boot", "Django"],
  },
  {
    canonical: "Svelte",
    aliases: ["svelte", "sveltejs", "sveltekit"],
    category: "Frontend",
    related: ["JavaScript", "TypeScript"],
    complements: ["Node.js", "PostgreSQL"],
  },
  {
    canonical: "HTML",
    aliases: ["html", "html5"],
    category: "Frontend",
    related: ["CSS", "JavaScript"],
    complements: [],
  },
  {
    canonical: "CSS",
    aliases: ["css", "css3", "sass", "scss", "less"],
    category: "Frontend",
    related: ["HTML", "Tailwind CSS"],
    complements: [],
  },
  {
    canonical: "Tailwind CSS",
    aliases: ["tailwind", "tailwindcss", "tailwind css"],
    category: "Frontend",
    related: ["CSS", "HTML", "React"],
    complements: [],
  },
  {
    canonical: "Redux",
    aliases: ["redux", "redux toolkit", "rtk"],
    category: "Frontend",
    related: ["React", "JavaScript"],
    complements: [],
  },

  // ── Backend ────────────────────────────────────────────────────────────────
  {
    canonical: "Node.js",
    aliases: ["node", "nodejs", "node.js", "node js"],
    category: "Backend",
    related: ["JavaScript", "TypeScript", "Express", "NestJS"],
    complements: ["React", "Vue.js", "Angular", "MongoDB", "PostgreSQL"],
  },
  {
    canonical: "Express",
    aliases: ["express", "expressjs", "express.js"],
    category: "Backend",
    related: ["Node.js", "JavaScript"],
    complements: ["React", "MongoDB", "PostgreSQL"],
  },
  {
    canonical: "NestJS",
    aliases: ["nestjs", "nest.js", "nest js"],
    category: "Backend",
    related: ["Node.js", "TypeScript"],
    complements: ["React", "Angular", "PostgreSQL"],
  },
  {
    canonical: "Django",
    aliases: ["django"],
    category: "Backend",
    related: ["Python", "PostgreSQL"],
    complements: ["React", "Vue.js", "Angular"],
  },
  {
    canonical: "Flask",
    aliases: ["flask"],
    category: "Backend",
    related: ["Python"],
    complements: ["React", "Vue.js"],
  },
  {
    canonical: "FastAPI",
    aliases: ["fastapi", "fast api"],
    category: "Backend",
    related: ["Python"],
    complements: ["React", "Vue.js", "Next.js"],
  },
  {
    canonical: "Spring Boot",
    aliases: ["spring", "spring boot", "springboot"],
    category: "Backend",
    related: ["Java", "Kotlin"],
    complements: ["React", "Angular", "PostgreSQL"],
  },
  {
    canonical: "Laravel",
    aliases: ["laravel"],
    category: "Backend",
    related: ["PHP", "MySQL"],
    complements: ["React", "Vue.js"],
  },
  {
    canonical: "GraphQL",
    aliases: ["graphql", "graph ql"],
    category: "Backend",
    related: ["REST API", "Apollo"],
    complements: ["React", "Node.js"],
  },
  {
    canonical: "REST API",
    aliases: ["rest", "rest api", "restful", "restful api"],
    category: "Backend",
    related: ["Node.js", "Express", "Django"],
    complements: ["React", "Vue.js", "Angular"],
  },

  // ── Database ───────────────────────────────────────────────────────────────
  {
    canonical: "MongoDB",
    aliases: ["mongodb", "mongo", "mongoose"],
    category: "Database",
    related: ["Node.js", "Express"],
    complements: ["React", "Vue.js", "Angular"],
  },
  {
    canonical: "PostgreSQL",
    aliases: ["postgresql", "postgres", "psql"],
    category: "Database",
    related: ["SQL", "Django", "Node.js"],
    complements: ["React", "Vue.js", "Django"],
  },
  {
    canonical: "MySQL",
    aliases: ["mysql"],
    category: "Database",
    related: ["SQL", "PHP", "Laravel"],
    complements: ["React", "Vue.js", "PHP"],
  },
  {
    canonical: "SQL",
    aliases: ["sql"],
    category: "Database",
    related: ["PostgreSQL", "MySQL"],
    complements: ["Python", "Node.js"],
  },
  {
    canonical: "Redis",
    aliases: ["redis"],
    category: "Database",
    related: ["Node.js", "Caching"],
    complements: ["React", "Node.js"],
  },
  {
    canonical: "Firebase",
    aliases: ["firebase"],
    category: "Database",
    related: ["Google Cloud", "JavaScript"],
    complements: ["React", "Flutter", "Android"],
  },
  {
    canonical: "Supabase",
    aliases: ["supabase"],
    category: "Database",
    related: ["PostgreSQL", "JavaScript"],
    complements: ["React", "Next.js"],
  },

  // ── AI / ML ────────────────────────────────────────────────────────────────
  {
    canonical: "Machine Learning",
    aliases: ["machine learning", "ml"],
    category: "AI/ML",
    related: ["Python", "TensorFlow", "PyTorch", "Scikit-learn"],
    complements: ["React", "Node.js", "FastAPI"],
  },
  {
    canonical: "Deep Learning",
    aliases: ["deep learning", "dl"],
    category: "AI/ML",
    related: ["PyTorch", "TensorFlow", "Python"],
    complements: ["FastAPI", "React"],
  },
  {
    canonical: "PyTorch",
    aliases: ["pytorch", "torch"],
    category: "AI/ML",
    related: ["Python", "Deep Learning", "Machine Learning"],
    complements: ["FastAPI", "React", "Node.js"],
  },
  {
    canonical: "TensorFlow",
    aliases: ["tensorflow", "tf"],
    category: "AI/ML",
    related: ["Python", "Deep Learning", "Keras"],
    complements: ["FastAPI", "React"],
  },
  {
    canonical: "Scikit-learn",
    aliases: ["scikit-learn", "sklearn", "scikit learn"],
    category: "AI/ML",
    related: ["Python", "Machine Learning", "NumPy", "Pandas"],
    complements: ["FastAPI", "React"],
  },
  {
    canonical: "LangChain",
    aliases: ["langchain", "lang chain"],
    category: "AI/ML",
    related: ["Python", "OpenAI"],
    complements: ["FastAPI", "React", "Node.js"],
  },
  {
    canonical: "OpenAI",
    aliases: ["openai", "gpt", "chatgpt"],
    category: "AI/ML",
    related: ["Python", "LangChain"],
    complements: ["React", "Node.js", "FastAPI"],
  },
  {
    canonical: "NumPy",
    aliases: ["numpy"],
    category: "AI/ML",
    related: ["Python", "Pandas", "Scikit-learn"],
    complements: [],
  },
  {
    canonical: "Pandas",
    aliases: ["pandas"],
    category: "AI/ML",
    related: ["Python", "NumPy", "Data Science"],
    complements: [],
  },
  {
    canonical: "Data Science",
    aliases: ["data science", "data analysis", "data analytics"],
    category: "AI/ML",
    related: ["Python", "R", "Pandas", "NumPy", "SQL"],
    complements: ["React", "Node.js", "FastAPI"],
  },

  // ── Mobile ─────────────────────────────────────────────────────────────────
  {
    canonical: "React Native",
    aliases: ["react native", "reactnative"],
    category: "Mobile",
    related: ["React", "JavaScript", "TypeScript"],
    complements: ["Node.js", "Firebase", "MongoDB"],
  },
  {
    canonical: "Flutter",
    aliases: ["flutter"],
    category: "Mobile",
    related: ["Dart", "Firebase"],
    complements: ["Node.js", "Firebase", "Django"],
  },
  {
    canonical: "Android",
    aliases: ["android"],
    category: "Mobile",
    related: ["Kotlin", "Java"],
    complements: ["Node.js", "Firebase", "Spring Boot"],
  },
  {
    canonical: "iOS",
    aliases: ["ios", "ios development"],
    category: "Mobile",
    related: ["Swift"],
    complements: ["Node.js", "Firebase"],
  },

  // ── DevOps / Cloud ─────────────────────────────────────────────────────────
  {
    canonical: "Docker",
    aliases: ["docker"],
    category: "DevOps",
    related: ["Kubernetes", "CI/CD", "Linux"],
    complements: ["Node.js", "Python", "Go", "React"],
  },
  {
    canonical: "Kubernetes",
    aliases: ["kubernetes", "k8s"],
    category: "DevOps",
    related: ["Docker", "CI/CD"],
    complements: ["Node.js", "Go", "Python"],
  },
  {
    canonical: "CI/CD",
    aliases: ["ci/cd", "cicd", "ci cd", "github actions", "jenkins", "gitlab ci"],
    category: "DevOps",
    related: ["Docker", "Kubernetes", "Git"],
    complements: ["Node.js", "Python", "Go"],
  },
  {
    canonical: "AWS",
    aliases: ["aws", "amazon web services"],
    category: "Cloud",
    related: ["Docker", "Kubernetes", "Terraform"],
    complements: ["Node.js", "Python", "Go", "React"],
  },
  {
    canonical: "Google Cloud",
    aliases: ["gcp", "google cloud", "google cloud platform"],
    category: "Cloud",
    related: ["Firebase", "Kubernetes", "Docker"],
    complements: ["Node.js", "Python", "Go"],
  },
  {
    canonical: "Azure",
    aliases: ["azure", "microsoft azure"],
    category: "Cloud",
    related: ["Docker", "Kubernetes"],
    complements: ["Node.js", "Python"],
  },
  {
    canonical: "Terraform",
    aliases: ["terraform"],
    category: "DevOps",
    related: ["AWS", "Google Cloud", "Azure"],
    complements: ["Go", "Python"],
  },
  {
    canonical: "Linux",
    aliases: ["linux", "unix", "bash", "shell scripting"],
    category: "DevOps",
    related: ["Docker", "CI/CD"],
    complements: ["Python", "Go", "Node.js"],
  },

  // ── Blockchain ─────────────────────────────────────────────────────────────
  {
    canonical: "Web3",
    aliases: ["web3", "web 3", "web3.js"],
    category: "Blockchain",
    related: ["Solidity", "Ethereum", "Smart Contracts"],
    complements: ["JavaScript", "TypeScript", "React"],
  },
  {
    canonical: "Ethereum",
    aliases: ["ethereum", "eth"],
    category: "Blockchain",
    related: ["Solidity", "Web3"],
    complements: ["JavaScript", "TypeScript"],
  },
  {
    canonical: "Smart Contracts",
    aliases: ["smart contracts", "smart contract"],
    category: "Blockchain",
    related: ["Solidity", "Ethereum", "Web3"],
    complements: ["JavaScript", "TypeScript", "React"],
  },

  // ── Design ─────────────────────────────────────────────────────────────────
  {
    canonical: "UI/UX Design",
    aliases: ["ui/ux", "ui ux", "ux design", "ui design", "figma", "user experience", "user interface"],
    category: "Design",
    related: ["CSS", "HTML", "Tailwind CSS"],
    complements: ["React", "Vue.js", "Angular", "Flutter"],
  },

  // ── Tools ──────────────────────────────────────────────────────────────────
  {
    canonical: "Git",
    aliases: ["git", "github", "gitlab", "version control"],
    category: "Tool",
    related: ["CI/CD", "Linux"],
    complements: [],
  },
  {
    canonical: "WebAssembly",
    aliases: ["webassembly", "wasm"],
    category: "Tool",
    related: ["Rust", "C++", "JavaScript"],
    complements: ["React", "Node.js"],
  },
];

// Build lookup maps at module load time for O(1) access.
const _aliasMap = new Map();    // alias (lowercase) → canonical
const _canonicalMap = new Map(); // canonical → entry

for (const entry of TAXONOMY) {
  _canonicalMap.set(entry.canonical, entry);
  for (const alias of entry.aliases) {
    _aliasMap.set(alias.toLowerCase(), entry.canonical);
  }
  // The canonical itself is also a valid lookup key.
  _aliasMap.set(entry.canonical.toLowerCase(), entry.canonical);
}

module.exports = { TAXONOMY, _aliasMap, _canonicalMap };
