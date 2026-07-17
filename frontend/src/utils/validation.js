export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isStrongPassword = (password) => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
};

export const validateSignupForm = (data) => {
  const errors = {};

  if (!data.firstName || data.firstName.trim().length < 2) {
    errors.firstName = "First name must be at least 2 characters";
  }

  if (!data.emailId) {
    errors.emailId = "Email is required";
  } else if (!isValidEmail(data.emailId)) {
    errors.emailId = "Invalid email format";
  }

  if (!data.password) {
    errors.password = "Password is required";
  } else if (data.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  } else if (!/[A-Z]/.test(data.password)) {
    errors.password = "Password must contain an uppercase letter";
  } else if (!/[a-z]/.test(data.password)) {
    errors.password = "Password must contain a lowercase letter";
  } else if (!/[0-9]/.test(data.password)) {
    errors.password = "Password must contain a number";
  }

  return errors;
};
