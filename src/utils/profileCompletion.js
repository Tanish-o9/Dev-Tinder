const profileFields = [
  "firstName", "lastName", "photoURL", "about", "skills", "developerRole",
  "experienceLevel", "collaborationInterests", "githubUsername", "location",
];

const hasValue = (value) => Array.isArray(value) ? value.length > 0 : Boolean(typeof value === "string" ? value.trim() : value);

const getProfileCompletion = (profile) => {
  const missingFields = profileFields.filter((field) => {
    if (field === "developerRole" && profile?.developerRole === "Other") return true;
    return !hasValue(profile?.[field]);
  });
  return { score: Math.round(((profileFields.length - missingFields.length) / profileFields.length) * 100), missingFields };
};

const profileSuggestions = {
  photoURL: "Add a profile photo",
  about: "Add a short developer bio",
  skills: "Add your skills",
  developerRole: "Add your developer role",
  experienceLevel: "Add your experience level",
  collaborationInterests: "Add collaboration interests",
  githubUsername: "Add your GitHub username",
  location: "Add your location",
  lastName: "Add your last name",
};

const getProfileSuggestions = (profile) => getProfileCompletion(profile).missingFields
  .map((field) => profileSuggestions[field])
  .filter(Boolean)
  .slice(0, 3);

module.exports = { getProfileCompletion, getProfileSuggestions };
