import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
  AxiosError,
} from "axios";

// Define your API base URL (should be in environment variables)
const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/";

// Define custom response type that includes your API's standard response structure
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  statusCode?: number;
}

// Extend AxiosRequestConfig to include your custom properties
export interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean; // For token refresh retry mechanism
}

// Create axios instance with custom config
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false, // Set to true if using cookies
});

// Request interceptor for adding auth token and other common headers
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling global response structure and errors
axiosInstance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // You can modify the response data structure here if needed
    // For example, if your API wraps all responses in a standard format

    // If your API returns data in a standard format like { data: {}, message: "", success: boolean }
    if (
      response.data &&
      typeof response.data === "object" &&
      "success" in response.data
    ) {
      return {
        ...response,
        data: response.data.data,
        message: response.data.message,
      };
    }

    return response;
  },
  (error: AxiosError<ApiResponse>) => {
    // Handle global error responses here

    if (error.response) {
      // Server responded with a status code outside 2xx range
      const { status, data } = error.response;

      // Handle specific status codes
      switch (status) {
        case 401:
          // Unauthorized - handled by AuthContext
          break;
        case 403:
          // Forbidden - maybe show access denied message
          break;
        case 404:
          // Not found - maybe redirect to 404 page
          break;
        case 500:
          // Server error - show generic error message
          break;
        default:
          // Other errors
          break;
      }

      // You can transform the error response here
      const apiError = new Error(
        data?.message || error.message || "An unknown error occurred"
      );
      return Promise.reject(apiError);
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject(
        new Error("Network error. Please check your connection.")
      );
    } else {
      // Something happened in setting up the request
      return Promise.reject(error);
    }
  }
);

export default axiosInstance;

// Helper functions for specific HTTP methods with proper typing
export const api = {
  get: <T>(url: string, config?: CustomAxiosRequestConfig) =>
    axiosInstance.get<T, AxiosResponse<T>>(url, config),

  post: <T>(url: string, data?: any, config?: CustomAxiosRequestConfig) =>
    axiosInstance.post<T, AxiosResponse<T>>(url, data, config),

  put: <T>(url: string, data?: any, config?: CustomAxiosRequestConfig) =>
    axiosInstance.put<T, AxiosResponse<T>>(url, data, config),

  patch: <T>(url: string, data?: any, config?: CustomAxiosRequestConfig) =>
    axiosInstance.patch<T, AxiosResponse<T>>(url, data, config),

  delete: <T>(url: string, config?: CustomAxiosRequestConfig) =>
    axiosInstance.delete<T, AxiosResponse<T>>(url, config),
};

// Type guards for error handling
export function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}

export function isApiResponse(response: unknown): response is ApiResponse {
  return (
    typeof response === "object" &&
    response !== null &&
    "success" in response &&
    "data" in response
  );
}
