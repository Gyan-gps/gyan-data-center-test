/**
 * Data Center API Functions
 * Contains all API calls related to data center assets and IT load data
 * All endpoints require authentication
 */

import { apiClient } from "@/services";
import type {
  DataCenterAsset,
  DataCenterFilters,
  ApiResponseForDataCenter,
  ApiResponseDataCenterDetails,
  ITLoadFilters,
  ITLoadResponse,
  CompanyListResponse,
  CompanyFilters,
  FilterOptions,
  FilterOptionsResponse,
  ReportFilters,
  ReportsResponse,
  ReportDownloadResponse,
  AnalyticsFilters,
  AnalyticsData,
  AnalyticsV2Summary,
  AnalyticsV2Charts,
  AnalyticsV2TopOperator,
  AnalyticsResponse,
  AnalyticsFilterOptions,
  AnalyticsFilterOptionsResponse,
  ITLoadSummaryData,
  CompanyAssetsContacts,
  ReportsFilterOptions,
  Report,
  Geography,
  ReportExtendedData,
} from "./datacenter.types";

/**
 * DATA CENTER API CALLS (Authentication required)
 */

export const getDataCenters = async (
  filters?: DataCenterFilters
): Promise<ApiResponseForDataCenter<DataCenterAsset>> => {
  // Set default sorting parameters
  const requestBody = {
    sortBy: "dataCenter",
    sortOrder: "asc" as const,
    ...filters, // Spread filters after defaults so they can override if needed
  };

  const response = await apiClient.post<
    ApiResponseForDataCenter<DataCenterAsset>
  >("/datacenter", requestBody);

  return response.data;
};

export const getDataCentersMaps = async (
  filters?: DataCenterFilters
): Promise<ApiResponseForDataCenter<DataCenterAsset>> => {
  const response = await apiClient.post<
    ApiResponseForDataCenter<DataCenterAsset>
  >("/datacenter/map", filters, { timeout: 60000 }); // 60 seconds timeout for map data

  return response.data;
};

export const getDataCenterById = async (
  id: string
): Promise<DataCenterAsset> => {
  const response = await apiClient.get<
    ApiResponseDataCenterDetails<DataCenterAsset>
  >(`/datacenter/${id}`);
  return response.data.asset;
};

export const getDataCenterByDcId = async (
  dcId: string
): Promise<ApiResponseDataCenterDetails<DataCenterAsset>> => {
  const response = await apiClient.get<
    ApiResponseDataCenterDetails<DataCenterAsset>
  >(`/datacenter/${dcId}`);
  return response.data;
};

/**
 * IT LOAD DATA API CALLS (Authentication required)
 */

export const getITLoadData = async (
  filters?: ITLoadFilters
): Promise<ITLoadResponse> => {
  const response = await apiClient.post<ITLoadResponse>(
    "/datacenter/itload",
    filters
  );
  return response.data;
};

export const getITLoadSummary = async (
  filters?: Omit<ITLoadFilters, "page" | "limit">
): Promise<ITLoadSummaryData> => {
  const response = await apiClient.post<ITLoadSummaryData>(
    "/datacenter/itload-summary",
    filters
  );
  return response.data;
};

/**
 * COMPANIES API CALLS (Authentication required)
 */

export const getDataCenterCompanies = async (
  filters?: CompanyFilters
): Promise<CompanyListResponse> => {
  const response = await apiClient.get<CompanyListResponse>(
    "/datacenter/companies",
    {
      params: filters,
    }
  );
  return response.data;
};

/**
 * Get assets for a specific company
 */
export const getCompanyAssets = async (
  companyId: string
): Promise<CompanyAssetsContacts> => {
  const response = await apiClient.get(`/datacenter/companies/${companyId}`);
  return response.data; // Backend returns { success: true, data: assets[] }
};

/**
 * FILTER OPTIONS API CALLS (Authentication required)
 */

export const getFilterOptions = async (): Promise<FilterOptions> => {
  const response = await apiClient.get<FilterOptionsResponse>(
    "/datacenter/filter-options"
  );
  return response.data;
};

/**
 * ANALYTICS API CALLS (Authentication required)
 */

export const getAnalyticsData = async (
  filters?: AnalyticsFilters
): Promise<AnalyticsData> => {
  const response = await apiClient.post<AnalyticsResponse>(
    "/datacenter/analytics",
    filters || {}
  );


  return response.data;
};

export const getAnalyticsFilterOptions =
  async (): Promise<AnalyticsFilterOptions> => {
    const response = await apiClient.get<AnalyticsFilterOptionsResponse>(
      "/datacenter/analytics-filter-options"
    );

    return response.data;
  };

export const getAnalyticsV2Summary = async (
  filters?: AnalyticsFilters
): Promise<AnalyticsV2Summary> => {
  const response = await apiClient.post<AnalyticsV2Summary>(
    "/datacenter/analytics-v2/summary",
    filters || {}
  );
  return response.data;
};

export const getAnalyticsV2Charts = async (
  filters?: AnalyticsFilters
): Promise<AnalyticsV2Charts> => {
  const response = await apiClient.post<AnalyticsV2Charts>(
    "/datacenter/analytics-v2/charts",
    filters || {}
  );
  return response.data;
};

export const getAnalyticsV2TopOperators = async (
  filters?: AnalyticsFilters
): Promise<AnalyticsV2TopOperator[]> => {
  const response = await apiClient.post<AnalyticsV2TopOperator[]>(
    "/datacenter/analytics-v2/top-operators",
    filters || {}
  );
  return response.data;
};

export const getAnalytics = async () => {
  // This would be a custom endpoint for analytics data
  const [dataCenters, itLoadData, companies] = await Promise.all([
    getDataCenters({ limit: 1000 }),
    getITLoadData({ limit: 1000 }),
    getDataCenterCompanies({ limit: 1000 }),
  ]);

  return {
    dataCenters,
    itLoadData,
    companies,
  };
};

/**
 * REPORTS API CALLS (Authentication required)
 */

export const getReports = async (
  filters?: ReportFilters
): Promise<ReportsResponse["data"]> => {
  const response = await apiClient.post<ReportsResponse["data"]>(
    "/datacenter/reports",
    filters || {}
  );

  return response.data;
};

export const requestReportAccess = async (
  userEmail: string,
  reportId: number
): Promise<{
  success: boolean;
  message: string;
  data?: { subscriptionId: string };
}> => {
  const response = await apiClient.post("/datacenter/request-report-access", {
    userEmail,
    reportId,
  });

  return response.data;
};

export const sendReportInterest = async (
  userEmail: string,
  reportId: number,
  reportTitle: string
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post("/datacenter/send-report-interest", {
    userEmail,
    reportId,
    reportTitle,
  });

  return response.data;
};

export const getReportsFilterOptions =
  async (): Promise<ReportsFilterOptions> => {
    const response = await apiClient.get<ReportsFilterOptions>(
      "/datacenter/reports-filter-options"
    );
    return response.data;
  };

export const downloadReport = async (
  reportId: number
): Promise<ReportDownloadResponse> => {
  const response = await apiClient.get<ReportDownloadResponse>(`/datacenter/download-report?reportId=${reportId}`);
  return response.data;
};

export const getReportBySlug = async (slug: string, email: string): Promise<Report> => {
  const response = await apiClient.get<Report>(
    `/datacenter/report/${slug}`,
    {
      params: { email } // Pass email as query parameter
    }
  );
  return response.data;
};

export const getReportSnippetBySlug = async (slug: string): Promise<{ data: string, template: string }> => {
  const response = await apiClient.get<{ data: string, template: string }>(
    `/datacenter/report-snippet/${slug}`
  );
  return response.data;
}

export const getReportExtendedSnippetBySlug = async (slug: string): Promise<ReportExtendedData> => {
  const response = await apiClient.get<{ data: ReportExtendedData }>(
    `/datacenter/report-snippetExtended/${slug}`
  );
  return response.data;
};

export const getAllGeography = async (): Promise<Array<Geography>> => {
  const response = await apiClient.get<{ default: Array<Geography> }>(
    `/datacenter/geographies`
  );
  return response.data.default as Array<Geography>;
}