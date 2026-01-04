import axios from "axios";
import apiConfig from "../config/apiConfig";

const httpClient = axios.create({
  baseURL: apiConfig.baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request interceptor: Attach user headers from localStorage
httpClient.interceptors.request.use(
  (config) => {
    // Get user data from localStorage
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem("token");
    
    // Attach user headers if user is logged in
    if (user.username) {
      config.headers["X-User-Name"] = user.username;
    }
    if (user.role) {
      config.headers["X-User-Role"] = user.role;
    }
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle errors
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default httpClient;

