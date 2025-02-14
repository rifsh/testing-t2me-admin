const dev = {
  API_ENDPOINT_URL: "http://192.168.29.8:8000",
  // API_ENDPOINT_URL: "https://uat-tickets2me.mitetechnology.in",
};

const uat = {
  API_ENDPOINT_URL: "https://uat-tickets2me.mitetechnology.in",
};
const demo = {
  API_ENDPOINT_URL: "https://demo-tickets2me.mitetechnology.in",
};
// temp
const prod = {
  API_ENDPOINT_URL: "https://uat-tickets2me.mitetechnology.in",
};

const test = {
  API_ENDPOINT_URL: "/api",
};

const getEnv = () => {
  switch (process.env.REACT_APP_ENV) {
    case "demo":
      return demo;
    case "uat":
      return uat;
    case "production":
      return prod;
    case "development":
      return dev;
    case "test":
      return test;
    default:
      return dev; // Fallback to development
  }
};

export const env = getEnv();
