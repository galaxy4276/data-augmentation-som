import axios from "axios";

// Detect if we're in production (Vercel) or development
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
const baseURL = isProduction ? "/api" : (process.env.NEXT_PUBLIC_API_URL || "/api");

const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
});

console.log(`API Client initialized with baseURL: ${baseURL} (isProduction: ${isProduction})`);

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(
      `[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`,
    );
    return response;
  },
  (error) => {
    console.error(
      "[API Response Error]",
      error.response?.data || error.message,
    );
    return Promise.reject(error);
  },
);

export default apiClient;
