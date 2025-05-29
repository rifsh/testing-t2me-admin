import axios from "axios";
import { API_BASE_URL } from "configs/AppConfig";
import { signOutSuccess, signOut } from "store/slices/authSlice";
import { AUTH_TOKEN } from "constants/AuthConstant";
import { notification } from "antd";
import store from "../store";
import Utils from "utils";
import { delay } from "lodash";
import { encryptAES, decryptAES, encryptParams, decryptParams } from "utils/aesDecrypt";
import { env } from "configs/EnvironmentConfig";

const {
  AES_KEY,
  NEED_ENCRYPT_DECRYPT,
  ENCRYPT_PARAMS,
  SKIP_ENCRYPTION_PATHS
} = env;

/* ──────────────────────────────────────────────
   NOTE: These HTTP-code constants are left in
   place but are no longer used for logout.
   ────────────────────────────────────────────── */
const unauthorizedCode = [401, 403];
const E2E_ERROR_CODE   = 424;

/* ──────────────────────────────────────────────
   NEW – custom codes that DO trigger logout
   ────────────────────────────────────────────── */
const SESSION_EXPIRE_CODE   = "00101";
const E2E_ERROR_CUSTOM_CODE = "00102";

let isLoggingOut = false; // Flag to prevent logout loop

const service = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  // headers: {
  //   'Access-Control-Allow-Origin': '*',
  //   'Content-Type': 'application/json',
  // }
});

// Helper function to check if path should skip parameter encryption
const shouldSkipEncryption = (url) => {
  return SKIP_ENCRYPTION_PATHS.some(path => url.includes(path));
};

// Config
service.interceptors.request.use(
  async (config) => {
    const TOKEN_PAYLOAD_KEY = "Authorization";
    const jwtToken = localStorage.getItem(AUTH_TOKEN) || null;

    if (jwtToken) {
      config.headers[TOKEN_PAYLOAD_KEY] = `Bearer ${jwtToken}`;
    }

    // ( enc started)
    // Encrypt URL parameters for GET requests
    if (NEED_ENCRYPT_DECRYPT && ENCRYPT_PARAMS && 
        config.params && 
        Object.keys(config.params).length > 0 && 
        !shouldSkipEncryption(config.url)) {
      try {
        console.log("[REQUEST] Original Params:", config.params);
        const encryptedParams = await encryptParams(config.params, AES_KEY);
        config.params = encryptedParams;
        console.log("[REQUEST] Params encrypted for transmission");
      } catch (error) {
        console.error("[REQUEST PARAMS ENCRYPTION ERROR]", error);
        // Continue with original params if encryption fails
      }
    }

    // Encrypt request body for POST/PUT requests
    if (NEED_ENCRYPT_DECRYPT && 
        (config.method === 'post' || config.method === 'put') && 
        config.data && 
        !shouldSkipEncryption(config.url)) {
      try {
        // Skip encryption for FormData (file uploads)
        if (config.data instanceof FormData) {
          console.log("[REQUEST] Skipping encryption for FormData");
        } else {
          // Only encrypt if content-type is application/json (or not specified, defaulting to JSON)
          const contentType = config.headers['Content-Type'] || config.headers['content-type'];
          if (!contentType || contentType.includes('application/json')) {
            console.log("[REQUEST] Original Data:", config.data);
            const encryptedData = await encryptAES(config.data, AES_KEY);
            config.data = { encrypted: encryptedData };
            console.log("[REQUEST] Data encrypted for transmission");
          }
        }
      } catch (error) {
        console.error("[REQUEST ENCRYPTION ERROR]", error);
        // Continue with original data if encryption fails
      }
    }
    // ( enc ended)

    // Log the outgoing request details
    console.log(
      `%c[REQUEST] URL: ${config.baseURL + config.url}`,
      "color: #1d8cf8; font-weight: bold;"
    );
    console.log("[REQUEST] Headers:", config.headers);

    if (config.data) {
      console.log("[REQUEST] Data:", config.data);
    } else {
      console.log(
        "[REQUEST] Data: No payload (likely a GET request or undefined)"
      );
    }

    if (config.params) {
      console.log("[REQUEST] Query Params:", config.params);
    }
    config.withCredentials = true;
    return config;
  },
  (error) => {
    console.error(
      "%c[REQUEST ERROR]",
      "color: #f5365c; font-weight: bold;",
      error
    );
    notification.error({
      message: "Request Error",
      description:
        "An error occurred while sending the request. Please check the console for details.",
    });
    return Promise.reject(error);
  }
);

// Response Interceptor
service.interceptors.response.use(
  async (response) => {
    console.log(
      `%c[RESPONSE] URL: ${response.config.baseURL + response.config.url}`,
      "color: #2dce89; font-weight: bold;"
    );
    console.log("[RESPONSE] Raw Data:", response.data);
    const newToken = response.headers["new-token"];
    if (newToken) {
      localStorage.setItem("auth_token", newToken);
    }

    // ( enc  for response started)
    // Decrypt response if it's encrypted
    if (NEED_ENCRYPT_DECRYPT && response.data?.encrypted) {
      try {
        const decrypted = await decryptAES(response.data.encrypted, AES_KEY);
        console.log("[RESPONSE] Decrypted Data:", decrypted);
        return decrypted;
      } catch (e) {
        console.error("[DECRYPTION ERROR]", e);
        // Continue with original response if decryption fails
        console.warn("[DECRYPTION FALLBACK] Returning original response");
      }
    }
    // ( enc  for response ended)

    return response.data;
  },
  async (error) => {
    console.error(
      "%c[RESPONSE ERROR]",
      "color: #f5365c; font-weight: bold;",
      error
    );

    let notificationParam = { message: "" };

    if (error.response) {
      const { status, data, config } = error.response;

      // Check if the current request is a logout request
      const isLogoutRequest = config.url.includes("/logout");

      console.log(
        `[ERROR] URL: ${config.baseURL + config.url}`,
        "Status Code:",
        status
      );
      console.log("[ERROR] Response Data:", data);

      /* ────────────────────────────────────────
         Extract custom_code (if any)
         ──────────────────────────────────────── */
      const customCode =
        data?.custom_code ||
        (data?.status && data.status.custom_code);

      /* ────────────────────────────────────────
         Logout only if custom_code is 00101/00102
         ──────────────────────────────────────── */
      const shouldLogout =
        !isLoggingOut &&
        !isLogoutRequest &&
        (customCode === SESSION_EXPIRE_CODE || customCode === E2E_ERROR_CUSTOM_CODE);

      if (shouldLogout) {
        try {
          isLoggingOut = true;

          if (customCode === SESSION_EXPIRE_CODE) {
            notificationParam.message = "Session Expired";
            notificationParam.description =
              "Your session has expired. Please log in again.";
          } else if (customCode === E2E_ERROR_CUSTOM_CODE) {
            // Message = status.message, Description = status.status_code
            notificationParam.message =
              data?.status?.message || "E2E Failure";
            notificationParam.description =
              data?.status?.status_code || "E2E encryption error";
          }

          await store.dispatch(signOut());
          await Utils.clearAllBrowserData();
          store.dispatch(signOutSuccess());

          // Optional: Redirect to login page
          // window.location.href = '/login';
        } finally {
          isLoggingOut = false; // Reset the flag after logout process
        }
      } else if (data.status && data.status.status_code) {
        const errorMessage = data.status.message;
        notificationParam.message = data.status.status_code;
        notificationParam.description = errorMessage;
      } else {
        // Handle other status codes
        switch (status) {
          case 404:
            notificationParam.message = "Resource Not Found";
            notificationParam.description =
              "The requested resource could not be found. Please check the URL or try again later.";
            break;
          case 400:
            notificationParam.message = "Invalid Request";
            notificationParam.description =
              "The request could not be processed due to incorrect data. Please check your input and try again.";
            break;
          case 500:
            notificationParam.message = "Server Error";
            notificationParam.description =
              "An unexpected error occurred on the server. Please try again later.";
            break;
          case 503:
            notificationParam.message = "Service Unavailable";
            notificationParam.description =
              "The server is temporarily unavailable. Please try again later.";
            break;
          case 508:
            notificationParam.message = "Timeout";
            notificationParam.description =
              "The server took too long to respond. Please check your internet connection or try again.";
            break;
          default:
            notificationParam.message = "Unexpected Error";
            notificationParam.description =
              "An unexpected error occurred. Please try again or contact support if the issue persists.";
        }
      }
    } else {
      notificationParam.message = "Network Error";
      notificationParam.description =
        "Unable to connect to the server. Please check your internet connection.";
    }

    // Show error notification only if it's not a logout request
    if (!error.config.url.includes("/logout")) {
      notification.error(notificationParam);
    }

    return Promise.reject(error);
  }
);

export default service;
