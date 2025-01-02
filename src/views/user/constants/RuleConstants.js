import { USER_VALIDATION_MESSAGES } from "./ValidationMessage";

export const userRules = {
  username: [
    {
      required: true,
      message: "Please enter username",
    },
    {
      min: 3,
      max: 16,
      message: USER_VALIDATION_MESSAGES.username.length,
    },
    {
      pattern: /^[a-zA-Z0-9]+$/, // Only allows letters and numbers
      message: USER_VALIDATION_MESSAGES.username.format,
    },
  ],
  email: [
    {
      required: true,
      message: USER_VALIDATION_MESSAGES.email.required,
    },
    {
      type: "email",
      message: USER_VALIDATION_MESSAGES.email.valid,
    },
    {
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: USER_VALIDATION_MESSAGES.email.format,
    },
  ],
  password: [
    {
      required: true,
      message: USER_VALIDATION_MESSAGES.password.required,
    },
    {
      min: 8,
      message: USER_VALIDATION_MESSAGES.password.minLength,
    },
    {
      max: 16,
      message: USER_VALIDATION_MESSAGES.password.maxLength,
    },
    {
      pattern:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      message: USER_VALIDATION_MESSAGES.password.complexity,
    },
  ],
  role: [
    {
      required: true,
      message: USER_VALIDATION_MESSAGES.role.required,
    },
  ],
};
