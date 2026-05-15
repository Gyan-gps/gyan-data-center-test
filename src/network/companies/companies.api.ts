/**
 * Companies API Functions
 * Contains all API calls related to company data
 * All endpoints require authentication
 */

import { apiClient } from "@/services";
import type { CompanyListResponse, CompanyFilters, CompanyFilterOptions } from "./companies.types";

/**
 * COMPANIES API CALLS (Authentication required)
 * Note: Companies are accessed via the datacenter API
 */

export const getCompanies = async (
  filters?: CompanyFilters
): Promise<CompanyListResponse> => {
  const response = await apiClient.post<CompanyListResponse>(
    "/datacenter/companies",
    filters || {}
  );
  return response.data;
};

/**
 * Get filter options for companies
 */
export const getCompanyFilterOptions = async (): Promise<CompanyFilterOptions> => {
  const response = await apiClient.get<CompanyFilterOptions>(
    "/datacenter/companies-filter-options"
  );
  return response.data;
};


/**
 * Get Company details by ID
 */
export const getCompanyDetailsById = async (companyId: string) => {
  const response = await apiClient.get(`/datacenter/companies/${companyId}`);
  return response.data;
};
