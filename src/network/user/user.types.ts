/**
 * User API Types
 * Contains all types related to user API calls
 */

import type { User } from "@/types";

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
    allowedPages: string[];
    allowExport: boolean;
    notes: string;
    startDate?: string;
    expiresOn?: string;
    myraTotalCredits: number;
    myraRemainingCredits: number;
    onDemandTotalCredits: number;
    onDemandRemainingCredits: number;
    phone?: string;
    company?:string;
    createdTime: string;
    favouriteDataCenters: string[];
    favouriteCompanies: string[];
    trial: boolean;
  };
  expiresIn: string;
}

export interface UserProfile extends User {
  createdTime: string;
}

export interface UpdateProfileRequest {
  email?: string;
  password?: string;
}

export interface UpdateProfileResponse {
  user: UserProfile;
  message: string;
}

export interface RefreshTokenResponse {
  token: string;
}

export interface LogoutResponse {
  message: string;
}
