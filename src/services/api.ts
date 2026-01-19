import axios from "axios";

const API_BASE_URL = "http://localhost:8090/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      removeToken();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Token management
const TOKEN_KEY = "railway_auth_token";
const USER_KEY = "railway_user";

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredUser = (): string | null => {
  return localStorage.getItem(USER_KEY);
};

export const setStoredUser = (user: string): void => {
  localStorage.setItem(USER_KEY, user);
};

export default api;
