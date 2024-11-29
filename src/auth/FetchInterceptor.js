import axios from 'axios';
import { API_BASE_URL } from 'configs/AppConfig';
import { signOutSuccess } from 'store/slices/authSlice';
import store from '../store';
import { AUTH_TOKEN } from 'constants/AuthConstant';
import { notification } from 'antd';

const unauthorizedCode = [400, 401, 403];

const service = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

// Config
const TOKEN_PAYLOAD_KEY = 'authorization';
  const jwtToken = localStorage.getItem(AUTH_TOKEN) || null;

// Request Interceptor
service.interceptors.request.use(
  (config) => {
    // let jwtToken = HARDCODED_TOKEN;

    if (jwtToken) {
      config.headers[TOKEN_PAYLOAD_KEY] = `Bearer ${jwtToken}`;
    }

    // Log the outgoing request details
    console.log(
      `%c[REQUEST] URL: ${config.baseURL + config.url}`,
      'color: #1d8cf8; font-weight: bold;'
    );
    console.log('[REQUEST] Headers:', config.headers);

	if (config.data) {
		console.log('[REQUEST] Data:', config.data);
	} else {
		console.log('[REQUEST] Data: No payload (likely a GET request or undefined)');
	}

	if (config.params) {
		console.log('[REQUEST] Query Params:', config.params);
	}
    return config;
  },
  (error) => {
    // Log request error details
    console.error('%c[REQUEST ERROR]', 'color: #f5365c; font-weight: bold;', error);
    notification.error({
      message: 'Request Error',
      description: 'An error occurred while sending the request. Please check the console for details.',
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
      'color: #2dce89; font-weight: bold;'
    );
    console.log('[RESPONSE] Data:', response.data);

    return response.data;
  },
  (error) => {
    // Log the response error details
    console.error('%c[RESPONSE ERROR]', 'color: #f5365c; font-weight: bold;', error);
    let notificationParam = { message: '' };

    if (error.response) {
      const { status, config } = error.response;

      // Log the error details
      console.log(
        `[ERROR] URL: ${config.baseURL + config.url}`,
        'Status Code:',
        status
      );
      console.log('[ERROR] Response Data:', error.response.data);

      if (unauthorizedCode.includes(status)) {
        notificationParam.message = 'Authentication Failed';
        notificationParam.description = 'Please login again.';
        localStorage.removeItem(AUTH_TOKEN);

        store.dispatch(signOutSuccess());
      } else if (status === 404) {
        notificationParam.message = 'Not Found';
        notificationParam.description = 'The requested resource was not found.';
      } else if (status === 500) {
        notificationParam.message = 'Internal Server Error';
        notificationParam.description = 'A server error occurred. Please try again later.';
      } else if (status === 508) {
        notificationParam.message = 'Time Out';
        notificationParam.description = 'The server took too long to respond. Please try again.';
      } else {
        notificationParam.message = 'Error';
        notificationParam.description = 'An unexpected error occurred.';
      }
    } else {
      console.error('[ERROR] No Response Received:', error);
      notificationParam.message = 'Network Error';
      notificationParam.description = 'Unable to connect to the server. Please check your network connection.';
    }

    notification.error(notificationParam);
    return Promise.reject(error);
  }
);

export default service;
