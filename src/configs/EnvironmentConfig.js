const dev = {
      API_ENDPOINT_URL: "https://uat-tickets2me.mitetechnology.in",

  // API_ENDPOINT_URL: 'http://192.168.29.223:8000'
  // API_ENDPOINT_URL: 'http://192.168.47.187:8000'
  //  API_ENDPOINT_URL: 'http://192.168.1.21:8000'
  // // API_ENDPOINT_URL: "http://127.0.0.1:8000",
  // API_ENDPOINT_URL: "http://127.0.0.1:8000",
  //API_ENDPOINT_URL: "http://192.168.29.222:8000"
};

const uat = {
  API_ENDPOINT_URL: "https://uat-tickets2me.mitetechnology.in",
};
const demo = {
  API_ENDPOINT_URL: "https://demo-tickets2me.mitetechnology.in",
};

const prod = {
  API_ENDPOINT_URL: "https://tickets2me.mitetechnology.in",
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
      return dev;  // Fallback to development
  }
};

export const env = getEnv();

