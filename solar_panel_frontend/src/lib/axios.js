import axios from 'axios';
import { getApiBaseUrl } from '../config/apiBase.js';

const API_BASE_URL = getApiBaseUrl();

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  // NOTE: Don't set default Content-Type here - it breaks FormData requests
  // Content-Type will be set per request or auto-detected
});

let toastCallback = null;

export const setToastCallback = (callback) => {
  toastCallback = callback;
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Only set Content-Type to JSON if NOT FormData
    // FormData needs browser to auto-set Content-Type with boundary
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;

    // Handle 401 Unauthorized - token expired or invalid
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if (toastCallback) {
        toastCallback('Session expired. Please login again.', 'error');
      }

      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    }

    // Handle 403 Forbidden - Access Denied
    // Don't show toast here, let the component handle it to avoid duplicate toasts
    // The error message will be in error.response.data.message

    // Handle network errors (no response)
    if (!error.response) {
      if (toastCallback) {
        toastCallback('Network error. Please check your connection.', 'error');
      }
    }

    // Always reject so the calling code can handle the error
    return Promise.reject(error);
  }
);

export default axiosInstance;