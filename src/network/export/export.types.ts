/**
 * Export API Types
 * Contains all types related to export functionality
 */

export interface ExportRequest {
  data: "datacenters" | "companies" | "itload";
  format: "csv" | "excel";
  filters?: {
    country?: string;
    company?: string;
    startDate?: string;
    endDate?: string;
    [key: string]: unknown;
  };
}

// Specific export request for data centers
export interface ExportDataCenterRequest {
  format?: "csv" | "excel";
  limit?: number;
  filters?: {
    // Array filters
    statuses?: string[];
    operators?: string[];
    dcTypes?: string[];
    tierLevels?: string[];
    regions?: string[];
    countries?: string[];
    cities?: string[];
    // Range filters
    minYear?: number;
    maxYear?: number;
    minITLoadMW?: number;
    maxITLoadMW?: number;
    // Search
    dataCenter?: string;
    [key: string]: unknown;
  };
}

// Specific export request for IT Load
export interface ExportITLoadRequest {
  format?: "csv" | "excel";
  limit?: number;
  filters?: {
    regions?: string | string[];
    countries?: string | string[];
    cities?: string | string[];
    operator?: string;
    year?: number;
    forecast?: boolean;
    minYear?: number;
    maxYear?: number;
    tierLevel?: string;
    facilityType?: string;
    status?: string;
    minITLoadMW?: number;
    maxITLoadMW?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    [key: string]: unknown;
  };
}

export interface ExportResponse {
  downloadUrl: string;
  filename: string;
  format: string;
  expiresAt: string;
}

export interface ExportOptionsResponse {
  options: {
    formats: Array<{
      value: string;
      label: string;
      description: string;
    }>;
    dataTypes: Array<{
      value: string;
      label: string;
      description: string;
    }>;
    permissions: {
      canView: boolean;
      canDownload: boolean;
      canExport: boolean;
    };
  };
}

export interface ExportPreviewRequest {
  data: "datacenters" | "companies" | "itload";
  format: "csv" | "excel";
  filters?: {
    country?: string;
    company?: string;
    [key: string]: unknown;
  };
}

export interface ExportPreviewResponse {
  preview: {
    headers: string[];
    rows: string[][];
    format: string;
  };
  dataType: string;
  totalRecords: string;
  message: string;
}

export interface ExportStatsResponse {
  stats: {
    totalExports: number;
    thisMonth: number;
    thisWeek: number;
    lastExport: string;
    favoriteFormat: string;
    favoriteDataType: string;
  };
}

// Specific export request for companies
export interface ExportCompanyRequest {
  format?: "csv" | "excel";

  filters?: {
    companies?: string[]; // Selected company names
    companyTypes?: string[]; // Company types: operator, tenant, provider
    hqCountries?: string[]; // HQ countries
    hqRegions?: string[]; // HQ regions
    hqCities?: string[]; // HQ cities
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  };
}
