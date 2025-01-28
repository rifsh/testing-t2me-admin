import axios from "axios";
import { API_BASE_URL } from "configs/AppConfig";
import { signOutSuccess, signOut } from "store/slices/authSlice";
import { AUTH_TOKEN } from "constants/AuthConstant";
import { notification } from "antd";
import store from "../store";
import Utils from "utils";

const unauthorizedCode = [401, 403];
let isLoggingOut = false; // Flag to prevent logout loop

const service = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

// Config
service.interceptors.request.use(
  (config) => {
    const TOKEN_PAYLOAD_KEY = "Authorization";
    const jwtToken = localStorage.getItem(AUTH_TOKEN) || null;

    if (jwtToken) {
      config.headers[TOKEN_PAYLOAD_KEY] = `Bearer ${jwtToken}`;
    }

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
  (response) => {
    console.log(
      `%c[RESPONSE] URL: ${response.config.baseURL + response.config.url}`,
      "color: #2dce89; font-weight: bold;"
    );
    console.log("[RESPONSE] Data:", response.data);
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
      const isLogoutRequest = config.url.includes('/logout');

      console.log(
        `[ERROR] URL: ${config.baseURL + config.url}`,
        "Status Code:",
        status
      );
      console.log("[ERROR] Response Data:", data);

      // Handle unauthorized errors only if we're not already logging out
      // and this is not a logout request
      if (unauthorizedCode.includes(status) && !isLoggingOut && !isLogoutRequest) {
        try {
          isLoggingOut = true; // Set the flag before starting logout process
          notificationParam.message = "Session Expired";
          notificationParam.description =
            "Your session has expired. Please log in again.";
          
          await store.dispatch(signOut());
          await Utils.clearAllBrowserData();
          store.dispatch(signOutSuccess());
          
          // Optional: Redirect to login page
          window.location.href = '/login';
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
    if (!error.config.url.includes('/logout')) {
      notification.error(notificationParam);
    }
    
    return Promise.reject(error);
  }
);

export default service;