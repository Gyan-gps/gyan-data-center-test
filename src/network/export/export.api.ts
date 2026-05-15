/**
 * Export API Functions
 * Contains all API calls related to data export functionality
 */

import { apiClient } from '@/services/api'
import type { 
  ExportRequest, 
  ExportOptionsResponse, 
  ExportPreviewRequest,
  ExportPreviewResponse,
  ExportStatsResponse,
  ExportDataCenterRequest,
  ExportITLoadRequest,
  ExportCompanyRequest
} from './export.types'

/**
 * PRIVATE API CALLS (Authentication required)
 */

export const getExportOptions = async (): Promise<ExportOptionsResponse> => {
  const response = await apiClient.get<ExportOptionsResponse>('/export/options')
  return response.data
}

export const getExportPreview = async (data: ExportPreviewRequest): Promise<ExportPreviewResponse> => {
  const response = await apiClient.post<ExportPreviewResponse>('/export/preview', data)
  return response.data
}

export const exportData = async (data: ExportRequest): Promise<Blob> => {
  const response = await apiClient.post('/export', data, {
    responseType: 'blob'
  })
  return response.data
}

export const getExportStats = async (): Promise<ExportStatsResponse> => {
  const response = await apiClient.get<ExportStatsResponse>('/export/stats')
  return response.data
}

/**
 * Export data centers with filters as Excel/CSV file
 * POST /api/export/datacenters
 */
export const exportDataCenters = async (data: ExportDataCenterRequest): Promise<Blob> => {
  const response = await apiClient.post('/export/datacenters', data, {
    responseType: 'blob'
  })
  return response.data
}

/**
 * Export IT Load data with filters as Excel/CSV file  
 * POST /api/export/itload
 */
export const exportITLoad = async (data: ExportITLoadRequest): Promise<Blob> => {
  const response = await apiClient.post('/export/itload', data, {
    responseType: 'blob'
  })
  return response.data
}

/**
 * Export companies data with filters as Excel/CSV file  
 * POST /api/export/companies
 */
export const exportCompanies = async (data: ExportCompanyRequest): Promise<Blob> => {
  const response = await apiClient.post('/export/companies', data, {
    responseType: 'blob'
  })
  return response.data
}
