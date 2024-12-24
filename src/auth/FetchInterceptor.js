import axios from "axios";
import { API_BASE_URL } from "configs/AppConfig";
import { signOutSuccess } from "store/slices/authSlice";
import { AUTH_TOKEN } from "constants/AuthConstant";
import { notification } from "antd";
import store from "../store";

const unauthorizedCode = [401, 403];

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
    // Log request error details
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
    // Log the successful response details
    console.log(
      `%c[RESPONSE] URL: ${response.config.baseURL + response.config.url}`,
      "color: #2dce89; font-weight: bold;"
    );
    console.log("[RESPONSE] Data:", response.data);
    return response.data;
  },
  (error) => {
    // Log the response error details
    console.error(
      "%c[RESPONSE ERROR]",
      "color: #f5365c; font-weight: bold;",
      error
    );

    let notificationParam = { message: "" };

    if (error.response) {
      const { status, data, config } = error.response;

      // Log the error details
      console.log(
        `[ERROR] URL: ${config.baseURL + config.url}`,
        "Status Code:",
        status
      );
      console.log("[ERROR] Response Data:", data);

      // Handle unique constraint violation error (duplicate category)
      if (data.status && data.status.status_code) {
        if (unauthorizedCode.includes(status)) {
          notificationParam.message = "Session Expired";
          notificationParam.description =
            "Your session has expired. Please log in again.";
          localStorage.removeItem(AUTH_TOKEN);
          store.dispatch(signOutSuccess());
        }
        const errorMessage = data.status.message;
        notificationParam.message = data.status.status_code;
        notificationParam.description = errorMessage;
      } else {
        // Custom Network errors handled if tickets2me server not giving any status code
        if (unauthorizedCode.includes(status)) {
          notificationParam.message = "Session Expired";
          notificationParam.description =
            "Your session has expired. Please log in again.";
          localStorage.removeItem(AUTH_TOKEN);
          store.dispatch(signOutSuccess());
        } else if (status === 404) {
          notificationParam.message = "Resource Not Found";
          notificationParam.description =
            "The requested resource could not be found. Please check the URL or try again later.";
        } else if (status === 400) {
          notificationParam.message = "Invalid Request";
          notificationParam.description =
            "The request could not be processed due to incorrect data. Please check your input and try again.";
        } else if (status === 500) {
          notificationParam.message = "Server Error";
          notificationParam.description =
            "An unexpected error occurred on the server. Please try again later.";
        } else if (status === 503) {
          notificationParam.message = "Service Unavailable";
          notificationParam.description =
            "The server is temporarily unavailable. Please try again later.";
        } else if (status === 508) {
          notificationParam.message = "Timeout";
          notificationParam.description =
            "The server took too long to respond. Please check your internet connection or try again.";
        } else {
          notificationParam.message = "Unexpected Error";
          notificationParam.description =
            "An unexpected error occurred. Please try again or contact support if the issue persists.";
        }
      }
    } else {
      notificationParam.message = "Unexpected Error";
      notificationParam.description =
        "An unexpected error occurred. Please try again or contact support if the issue persists.";
    }

    // Show the error notification
    notification.error(notificationParam);
    return Promise.reject(error);
  }
);

export default service;
