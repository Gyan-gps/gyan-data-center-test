import axios from "axios";
import type {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { API_BASE_URL, PUBLIC_API_BASE_URL } from "@/utils/constants";

// Define backend standard response type
interface BackendResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

// Define error response type
interface ErrorResponse {
  success: boolean;
  error?: string;
  message?: string;
  details?: unknown;
}

// Cookie key for JWT token
const AUTH_TOKEN_COOKIE = "auth_token";
const ADMIN_AUTH_TOKEN_COOKIE = "admin_auth_token";

// In-memory token (for best practice)
let memoryToken: string | null = null;

// Get auth token from memory, fallback to cookies
export const getAuthToken = (): string | null => {
  return memoryToken || Cookies.get(AUTH_TOKEN_COOKIE) || null;
};

// Set auth token in memory and cookies
export const setAuthToken = (token: string): void => {
  memoryToken = token;
  Cookies.set(AUTH_TOKEN_COOKIE, token, {
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
};

// Remove auth token from memory and cookies
export const removeAuthToken = (): void => {
  memoryToken = null;
  Cookies.remove(AUTH_TOKEN_COOKIE);
};

// Get admin auth token from cookies
export const getAdminAuthToken = (): string | null => {
  return Cookies.get(ADMIN_AUTH_TOKEN_COOKIE) || null;
};

// Set admin auth token in cookies
export const setAdminAuthToken = (token: string): void => {
  Cookies.set(ADMIN_AUTH_TOKEN_COOKIE, token, {
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
};

// Remove admin auth token from cookies
export const removeAdminAuthToken = (): void => {
  Cookies.remove(ADMIN_AUTH_TOKEN_COOKIE);
};

export const removeSessionFilters = (section?: string): void => {
  if (section) {
    sessionStorage.removeItem("filters-" + section);
  } else {
    // Remove all filters if no section specified
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith("filters-")) {
        sessionStorage.removeItem(key);
      }
    });
  }
};

// Create private API instance (requires authentication)
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

//synapse public API client (no auth, separate base URL)
export const synapseApiClient = axios.create({
  baseURL: import.meta.env.VITE_SYNAPSE_API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Create public API instance (no authentication required)
export const publicApiClient = axios.create({
  baseURL: PUBLIC_API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

function isAuthRefreshUrl(url: string): boolean {
  return url.includes("/auth/refresh");
}

/** Backend may return { token } or wrapped { success, data: { token } } before interceptor unwrap. */
function extractAccessToken(payload: unknown): string | null {
  if (payload && typeof payload === "object") {
    const p = payload as Record<string, unknown>;
    if (typeof p.token === "string") return p.token;
    if (p.data && typeof p.data === "object") {
      const inner = (p.data as Record<string, unknown>).token;
      if (typeof inner === "string") return inner;
    }
  }
  return null;
}

// Private API request interceptor - adds JWT token from cookies (user or admin)
apiClient.interceptors.request.use(
  (config) => {
    const url = config.url || "";

    // Refresh uses HttpOnly cookie only — do not send expired Authorization header
    if (isAuthRefreshUrl(url)) {
      config.withCredentials = true;
      delete (config.headers as Record<string, unknown>).Authorization;
      return config;
    }

    if (url.startsWith("/admin")) {
      // Admin routes - use admin token
      const adminToken = getAdminAuthToken();
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    } else {
      // User routes - use user token
      const userToken = getAuthToken();
      if (userToken) {
        config.headers.Authorization = `Bearer ${userToken}`;
      }
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// --- Refresh Token Flow (single in-flight promise shared across all 401 waiters) ---
let refreshPromise: Promise<string> | null = null;
let isRedirecting = false;

function doRefresh(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const res = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        {},
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        },
      );
      const body = res.data;
      const newToken = extractAccessToken(body);
      if (!newToken) throw new Error("No access token in refresh response");
      setAuthToken(newToken);
      return newToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

function forceLogout(message: string) {
  if (isRedirecting) return;
  isRedirecting = true;
  removeAuthToken();
  toast.error(message);
  window.location.href = "/";
}

apiClient.interceptors.response.use(
  (response: AxiosResponse<BackendResponse>) => {
    if (
      response.data &&
      typeof response.data === "object" &&
      "success" in response.data
    ) {
      if (response.data.success && response.data.data !== undefined) {
        return { ...response, data: response.data.data };
      } else if (!response.data.success && response.data.error) {
        throw new Error(response.data.error);
      }
    }
    return response;
  },

  async (error: AxiosError<ErrorResponse>) => {
    const status = error.response?.status;
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const reqUrl = originalRequest?.url || "";

    // ─── 401 handling ───────────────────────────────────────────
    if (status === 401) {
      // 1) Admin routes — separate auth, no refresh
      if (reqUrl.startsWith("/admin")) {
        removeAdminAuthToken();
        toast.error("Your admin session has expired. Please log in again.");
        window.location.href = "/admin/login";
        return Promise.reject(error);
      }

      // 2) First 401 on a user request → try silent refresh + retry
      if (!originalRequest?._retry && !isAuthRefreshUrl(reqUrl)) {
        if (originalRequest) originalRequest._retry = true;

        try {
          const token = await doRefresh();
          if (originalRequest) {
            originalRequest.headers =
              originalRequest.headers || ({} as typeof originalRequest.headers);
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          }
        } catch {
          /* refresh failed — fall through to redirect below */
        }
      }

      // 3) Refresh failed OR retried request still got 401 → session is dead
      forceLogout("Your session has expired. Please log in again.");
      return Promise.reject(error);
    }

    // ─── 403 trial expired ──────────────────────────────────────
    // if (
    //   status === 403 &&
    //   (error.response?.data as { code?: string } | undefined)?.code ===
    //     "TRIAL_EXPIRED"
    // ) {
    //   removeAuthToken();
    //   toast.error("Your trial account has expired. Please contact support.");
    //   window.location.href = "/?expired=true";
    //   return Promise.reject(error);
    // }

    if (status === 403 && reqUrl.includes("/users/authenticate-prodgain")) {
      return Promise.reject(error);
    }

    // ─── Other 4xx ──────────────────────────────────────────────
    if (status && status >= 400 && status < 500) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Something went wrong with your request";
      toast.error(message, { duration: 4000, position: "top-right" });
      return Promise.reject(error);
    }

    // ─── 5xx ────────────────────────────────────────────────────
    if (status && status >= 500) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Server error occurred";
      toast.error(message, { duration: 5000, position: "top-right" });
      return Promise.reject(error);
    }

    // ─── Network / unknown ──────────────────────────────────────
    toast.error("Network error. Please check your internet connection.", {
      duration: 5000,
      position: "top-right",
    });
    return Promise.reject(error);
  },
);

// Public API response interceptor - handles errors without auth logic
publicApiClient.interceptors.response.use(
  (response: AxiosResponse<BackendResponse>) => {
    // Extract the data from backend's standard response format
    if (
      response.data &&
      typeof response.data === "object" &&
      "success" in response.data
    ) {
      // If it's a backend response with success field, extract the data
      if (response.data.success && response.data.data !== undefined) {
        // Create a new response object with the extracted data
        return {
          ...response,
          data: response.data.data,
        };
      } else if (!response.data.success && response.data.error) {
        // Handle backend error responses
        throw new Error(response.data.error);
      }
    }
    return response;
  },
  (error: AxiosError<ErrorResponse>) => {
    const status = error.response?.status;

    if (status && status >= 400 && status <= 499) {
      // Client errors (400-499) - show warning toast
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Something went wrong with your request";
      toast.error(message, {
        duration: 4000,
        position: "top-right",
      });
    } else if (status && status >= 500) {
      // Server errors (500+) - show error toast
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Server error occurred";
      toast.error(message, {
        duration: 5000,
        position: "top-right",
      });
    } else {
      toast.error("Network error. Please check your internet connection.", {
        duration: 5000,
        position: "top-right",
      });
    }

    return Promise.reject(error);
  },
);
