/**
 * User API Functions
 * Contains all API calls related to user authentication and profile management
 */

import { apiClient, publicApiClient } from "@/services/api";
import type {
  LoginRequest,
  LoginResponse,
  UserProfile,
  UpdateProfileRequest,
  UpdateProfileResponse,
  RefreshTokenResponse,
  LogoutResponse,
} from "./user.types";

/**
 * AUTHENTICATION API CALLS (No authentication required)
 * Only login and registration endpoints are public
 */

export const loginUser = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  const response = await publicApiClient.post<LoginResponse>(
    "/auth/login",
    credentials,
    { withCredentials: true },
  );
  return response.data;
};

export const registerUser = async (
  userData: LoginRequest
): Promise<LoginResponse> => {
  const response = await publicApiClient.post<LoginResponse>(
    "/auth/register",
    userData,
    { withCredentials: true },
  );
  return response.data;
};

/**
 * USER PROFILE API CALLS (Authentication required)
 * All user profile and account management endpoints require authentication
 */

export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get<UserProfile>("/users/profile");
  return response.data;
};

export const updateUserProfile = async (
  data: UpdateProfileRequest
): Promise<UpdateProfileResponse> => {
  const response = await apiClient.put<UpdateProfileResponse>(
    "/users/profile",
    data
  );
  return response.data;
};

export const refreshUserToken = async (): Promise<RefreshTokenResponse> => {
  const response = await apiClient.post<RefreshTokenResponse>(
    "/auth/refresh",
    {},
    { withCredentials: true },
  );
  return response.data;
};

export const logoutUser = async (): Promise<LogoutResponse> => {
  const response = await apiClient.post<LogoutResponse>("/auth/logout", {}, { withCredentials: true });
  return response.data;
};

export interface HeartbeatResponse {
  remaining_seconds: number;
  trial_status: "active" | "expired";
}

export const sendTrialHeartbeat = async (remainingSeconds: number): Promise<HeartbeatResponse> => {
  const response = await apiClient.post<HeartbeatResponse>("/auth/heartbeat", {
    remaining_seconds: remainingSeconds
  });
  return response.data;
};

export const getTrialStatus = async (): Promise<HeartbeatResponse> => {
  const response = await apiClient.get<HeartbeatResponse>("/auth/trial-status");
  return response.data;
};

export const deleteUserAccount = async (): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>("/user/account");
  return response.data;
};

export interface PresignedUrlRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  contentType: string;
  contentDisposition: string;
}

export const generatePresignedUrl = async (
  data: PresignedUrlRequest
): Promise<PresignedUrlResponse> => {
  const response = await apiClient.post<PresignedUrlResponse>(
    "/users/generate-presigned-url",
    data
  );
  return response.data;
};

export const askAnalyst = async (data: {
  name: string;
  email: string;
  company: string;
  requestType: string;
  message: string;
  attachments?: string;
}): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>(
    "/users/ask-analyst",
    data
  );
  return response.data;
};

export interface UpdateFavoriteDataCenterRequest {
  dataCenterId: string;
  action: "add" | "remove";
}

export interface UpdateFavoriteDataCenterResponse {
  message: string;
  favorites: string[];
}

export const updateFavoriteDataCenter = async (
  data: UpdateFavoriteDataCenterRequest
): Promise<UpdateFavoriteDataCenterResponse> => {
  const response = await apiClient.put<UpdateFavoriteDataCenterResponse>(
    "/users/favorites",
    data
  );
  return response.data;
};

export interface FavoriteDataCenter {
  id: string;
  dcId: string;
  name: string;
  operatorName: string;
}

export const getFavoriteDataCenters = async (): Promise<FavoriteDataCenter[]> => {
  const response = await apiClient.get<FavoriteDataCenter[]>("/users/favorites");
  return response.data;
};

/**
 * Update user's favorite companies
 */
export const updateFavoriteCompany = async (data: { companyId: string; action: "add" | "remove" }) => {
  const response = await apiClient.put("/users/favorite-companies", data);
  return response.data;
};

/**
 * Get user's favorite companies
 */
export const getFavoriteCompanies = async (): Promise<{ id: string; companyId: string; name: string }[]> => {
  const response = await apiClient.get("/users/favorite-companies");
  return response.data;
};

/**
 * User Ticket Types
 */
export interface UserTicket {
  id: string;
  ticketId: string;
  submittedAt: string;
  attachments: string;
  email: string;
  status: string;
  message: string;
}

/**
 * Get user's submitted tickets
 */
export const getUserTickets = async (): Promise<UserTicket[]> => {
  const response = await apiClient.get("/users/tickets");
  return response.data;
};
