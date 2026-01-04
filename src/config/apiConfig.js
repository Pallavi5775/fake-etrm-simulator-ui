// src/config/apiConfig.js
// Usage: import apiConfig from "../config/apiConfig";

const isProd = process.env.NODE_ENV === "production";

const apiConfig = {
  baseURL: isProd
    ? "https://fake-etrm-simulator.onrender.com/api"
    : "http://localhost:8080/api"
};

export default apiConfig;
