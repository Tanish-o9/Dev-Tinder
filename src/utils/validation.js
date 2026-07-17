const validator = require("validator");
const developerRoles = ["Frontend Developer", "Backend Developer", "Full Stack Developer", "Mobile Developer", "AI/ML Engineer", "Data Scientist", "DevOps Engineer", "Cloud Engineer", "Cybersecurity Engineer", "UI/UX Developer", "Blockchain Developer", "Other"];
const experienceLevels = ["Beginner", "Intermediate", "Advanced"];
const interestOptions = ["Hackathons", "Open Source", "Startup", "College Projects", "AI Projects", "Web Development", "Mobile Development", "Research"];
const availabilityOptions = ["Available", "Open to Opportunities", "Busy"];

const normalizeProfileData = (body) => {
  if (body.educationType === "") body.educationType = undefined;
  if (body.developerRole === "") body.developerRole = undefined;
  if (body.experienceLevel === "") body.experienceLevel = undefined;
  if (body.availability === "") body.availability = undefined;
  if (typeof body.institutionName === "string") body.institutionName = body.institutionName.trim();
  if (body.socialLinks && typeof body.socialLinks === "object") {
    Object.keys(body.socialLinks).forEach((key) => {
      const value = body.socialLinks[key];
      if (typeof value !== "string") return;
      const trimmed = value.trim();
      body.socialLinks[key] = trimmed && !/^https?:\/\//i.test(trimmed) ? `https://${trimmed}` : trimmed;
    });
  }
};

const validateProfileLinks = (socialLinks) => {
  if (!socialLinks) return;
  if (typeof socialLinks !== "object" || Array.isArray(socialLinks)) {
    throw new Error("Social links must be an object");
  }
  const allowedLinks = ["linkedin", "github", "leetcode", "gfg", "codechef", "codeforces", "hackerrank"];
  Object.entries(socialLinks).forEach(([name, value]) => {
    if (!allowedLinks.includes(name) || (value && !validator.isURL(value, { protocols: ["http", "https"], require_protocol: true }))) {
      throw new Error("Please provide valid social profile URLs");
    }
  });
};

const validateDeveloperProfileFields = (body) => {
  if (body.developerRole && !developerRoles.includes(body.developerRole)) throw new Error("Invalid developer role");
  if (body.experienceLevel && !experienceLevels.includes(body.experienceLevel)) throw new Error("Invalid experience level");
  if (body.availability && !availabilityOptions.includes(body.availability)) throw new Error("Invalid availability status");
  if (body.collaborationInterests !== undefined) {
    if (!Array.isArray(body.collaborationInterests) || body.collaborationInterests.some((interest) => !interestOptions.includes(interest))) {
      throw new Error("Invalid collaboration interests");
    }
  }
  if (body.githubUsername && !/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(body.githubUsername)) {
    throw new Error("Invalid GitHub username");
  }
  if (body.skills !== undefined && (!Array.isArray(body.skills) || body.skills.length > 30 || body.skills.some((skill) => typeof skill !== "string" || !skill.trim() || skill.length > 50))) {
    throw new Error("Skills must be a list of up to 30 skill names");
  }
};

const validateSignUpData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;
  if (!firstName || firstName.trim().length < 2)
    throw new Error("First name must be at least 2 characters");
  if (lastName && lastName.trim().length > 50)
    throw new Error("Last name should not exceed 50 characters");
  if (!validator.isEmail(emailId))
    throw new Error("Please enter valid emailId!!");
  if (!password || password.length < 8)
    throw new Error("Password must be at least 8 characters");
  if (!/[A-Z]/.test(password))
    throw new Error("Password must contain at least one uppercase letter");
  if (!/[a-z]/.test(password))
    throw new Error("Password must contain at least one lowercase letter");
  if (!/[0-9]/.test(password))
    throw new Error("Password must contain at least one number");
  if (req.body.educationType && !["school", "college"].includes(req.body.educationType))
    throw new Error("Education type must be school or college");
  validateProfileLinks(req.body.socialLinks);
  validateDeveloperProfileFields(req.body);
};

const validateEditProfileData = (req) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "about",
    "skills",
    "photoURL",
    "educationType",
    "institutionName",
    "socialLinks",
    "developerRole",
    "experienceLevel",
    "collaborationInterests",
    "githubUsername",
    "location",
    "availability",
  ];
  const reqBodyFields = Object.keys(req.body);
  reqBodyFields.forEach((field) => {
    if (!allowedEditFields.includes(field))
      throw new Error("Invalid Edit Request");
  });
  if (req.body.educationType && !["school", "college"].includes(req.body.educationType))
    throw new Error("Education type must be school or college");
  validateProfileLinks(req.body.socialLinks);
  validateDeveloperProfileFields(req.body);
};

const validateEditPassword = async (req) => {
  const { currentPassword, newPassword } = req.body;
  const isCurrentPasswordCorrect = await req.user.validatePassword(
    currentPassword
  );
  if (!isCurrentPasswordCorrect)
    throw new Error("Current password is incorrect!!");
  if (!validator.isStrongPassword(newPassword))
    throw new Error("Please enter strong password");
};

module.exports = {
  normalizeProfileData,
  developerRoles,
  experienceLevels,
  interestOptions,
  availabilityOptions,
  validateSignUpData,
  validateEditProfileData,
  validateEditPassword,
};
