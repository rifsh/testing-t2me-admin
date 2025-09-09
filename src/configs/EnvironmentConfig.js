import { COMMON_SKIP_ENCRYPTION_PATHS } from "configs/encryptionConfigs ";

const dev = {
  // API_ENDPOINT_URL: "http://192.168.29.7:8000", 
  // // "http://192.168.29.8:8000/", //"http://192.168.29.221:8000",
  API_ENDPOINT_URL: "https://uat-tickets2me.mitetechnology.in",
  //  API_ENDPOINT_URL: "http://127.0.0.1:8000",
  AES_KEY: "your_32_byte_encryption_key_here",
  NEED_ENCRYPT_DECRYPT: false,
  ENCRYPT_PARAMS: false,
  SKIP_ENCRYPTION_PATHS: COMMON_SKIP_ENCRYPTION_PATHS,
  CDN_PATH: 'https://cdn-media.tickets2mecdn.org'
};

const uat = {
  API_ENDPOINT_URL: "https://uat-tickets2me.mitetechnology.in",
  AES_KEY: "your_32_byte_encryption_key_here",
  NEED_ENCRYPT_DECRYPT: false,
  ENCRYPT_PARAMS: false,
  SKIP_ENCRYPTION_PATHS: COMMON_SKIP_ENCRYPTION_PATHS,
  CDN_PATH: 'https://cdn-media.tickets2mecdn.org'
};
const demo = {
  API_ENDPOINT_URL: "https://demo-tickets2me.mitetechnology.in",
  AES_KEY: "your_32_byte_encryption_key_here",
  NEED_ENCRYPT_DECRYPT: false,
  SKIP_ENCRYPTION_PATHS: COMMON_SKIP_ENCRYPTION_PATHS,
  CDN_PATH: 'https://cdn-media.tickets2mecdn.org'
};
// temp
const prod = {
  API_ENDPOINT_URL: "https://api.tickets2me.com",
  AES_KEY: "your_32_byte_encryption_key_here",
  NEED_ENCRYPT_DECRYPT: false,
  ENCRYPT_PARAMS: false,
  SKIP_ENCRYPTION_PATHS: COMMON_SKIP_ENCRYPTION_PATHS,
  CDN_PATH: 'https://cdn-media.tickets2me.com'
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
    case "prod":
      return prod;
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
