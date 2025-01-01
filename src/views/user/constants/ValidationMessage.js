export const USER_VALIDATION_MESSAGES = {
    username: {
      format: "Username must contain only letters and spaces",
      length: "Username must be between 3 and 10 characters",
      spaces: "Username should not start or end with spaces",
    },
    email: {
      required: "Please enter an email address",
      valid: "Please enter a valid email address",
      format: "Email should be in format: example@domain.com",
    },
    password: {
      required: "Please enter password",
      minLength: "Password must be at least 8 characters",
      maxLength: "Password should not exceed 16 characters",
      complexity: "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character",
    },
    role: {
      required: "Please select a role",
    },
    events: {
      maxCount: "You can select up to 5 events",
    }
  };