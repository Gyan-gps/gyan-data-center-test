/**
 * Companies API Types
 * Contains all types related to companies API calls
 * Based on the API documentation
 */

// Re-export from datacenter types for consistency
export type { 
  Company, 
  CompanyListResponse, 
  CompanyFilters,
  CompanyFilterOptions,
  CompanyFilterOptionsResponse,
  ApiResponse,
  PaginatedResponse,
  PaginationMeta
} from '../datacenter/datacenter.types'
