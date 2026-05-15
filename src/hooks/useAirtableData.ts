import { useQuery, useMutation } from '@tanstack/react-query'
import { getDataCenters, getDataCenterCompanies, exportData, getITLoadData } from '@/network'
import type { DataCenterFilters, ITLoadFilters } from '@/types'
import type { ExportRequest } from '@/network/export/export.types'

export const useDataCenters = (filters?: DataCenterFilters) => {
  return useQuery({
    queryKey: ['dataCenters', filters],
    queryFn: async () => {
      const response = await getDataCenters(filters)
      return response // Response is already extracted by interceptor
    },
    staleTime: 5 * 60 * 1000, // 5 minutes,
  })
}

export const useCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await getDataCenterCompanies()
      return response // Response is already extracted by interceptor
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useITLoadData = (filters: ITLoadFilters) => {
  return useQuery({
    queryKey: ['itLoadData', filters],
    queryFn: async () => {
      const response = await getITLoadData(filters)
      return response // Response is already extracted by interceptor
    },
    enabled: !!filters.datacenter || !!filters.company,
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

export const useExportData = () => {
  return useMutation({
    mutationFn: async (request: ExportRequest) => {
      const response = await exportData(request)
      return response
    }
  })
}
