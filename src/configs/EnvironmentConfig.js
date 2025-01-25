const envConfigs = {
  development: {
    API_ENDPOINT_URL: "http://127.0.0.1:8000",
  },
  demo: {
    API_ENDPOINT_URL: "https://demo-tickets2me.mitetechnology.in",
  },
  uat: {
    API_ENDPOINT_URL: "https://uat-tickets2me.mitetechnology.in",
  },
  production: {
    API_ENDPOINT_URL: "https://tickets2me.mitetechnology.in",
  },
  test: {
    API_ENDPOINT_URL: "/api",
  },
} as const;

// Define the possible keys as a union type
type EnvKeys = keyof typeof envConfigs;

// Type guard to check if the environment is valid
const getEnvKey = (env: string | undefined): EnvKeys => {
  if (
    env === "development" ||
    env === "demo" ||
    env === "uat" ||
    env === "production" ||
    env === "test"
  ) {
    return env;
  }
  return "development"; // Default to development if undefined or invalid
};

// Use the type-guarded environment variable
export const env = envConfigs[getEnvKey(process.env.NEXT_PUBLIC_ENV)];
