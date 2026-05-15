/**
 * Admin API Functions
 * Contains all API calls related to admin authentication
 */

import { publicApiClient, apiClient } from '@/services/api';
import type { AdminLoginRequest, AdminLoginResponse } from './admin.types';

/**
 * Admin login endpoint (No authentication required)
 * Accepts email and password, returns JWT token and admin profile
 */
export const loginAdmin = async (
  credentials: AdminLoginRequest
): Promise<AdminLoginResponse> => {
  const response = await publicApiClient.post<AdminLoginResponse>(
    '/admin/login',
    credentials
  );
  return response.data;
};

/**
 * Fetch admin news articles with pagination and date filtering
 */
export const fetchAdminNews = async (filters?: {
  search?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}): Promise<any> => {
  const response = await apiClient.post<any>('/admin/news', {
    page: filters?.page || 1,
    limit: filters?.limit || 50,
    ...(filters?.search && { search: filters.search }),
    ...(filters?.startDate && { startDate: filters.startDate }),
    ...(filters?.endDate && { endDate: filters.endDate }),
  });
  return response.data;
};

export const fetchAdminAnalytics = async (filters?: {
  startDate?: string;
  endDate?: string;
  selectedYear?: number;
  selectedMonth?: number;
}): Promise<any> => {
  const response = await apiClient.post<any>("/admin/analytics", {
    ...(filters?.startDate && { startDate: filters.startDate }),
    ...(filters?.endDate && { endDate: filters.endDate }),
    ...(filters?.selectedYear && { selectedYear: filters.selectedYear }),
    ...(filters?.selectedMonth && { selectedMonth: filters.selectedMonth }),
  });

  return response.data?.data || response.data;
};
