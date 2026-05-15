import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '@/store'
import { getExportOptions, getExportPreview, exportData, getExportStats } from '@/network/export/export.api'
import type { ExportRequest, ExportPreviewRequest } from '@/network/export/export.types'

export const useExport = () => {
  const [isExporting, setIsExporting] = useState(false)
  const { hasDownloadAccess } = useAuthStore()

  // Get export options and permissions
  const { data: exportOptions } = useQuery({
    queryKey: ['exportOptions'],
    queryFn: getExportOptions,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  // Get export stats
  const { data: exportStats } = useQuery({
    queryKey: ['exportStats'],
    queryFn: getExportStats,
    enabled: hasDownloadAccess(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Export preview mutation
  const previewMutation = useMutation({
    mutationFn: (request: ExportPreviewRequest) => getExportPreview(request),
  })

  // Export data mutation
  const exportMutation = useMutation({
    mutationFn: async (request: ExportRequest) => {
      setIsExporting(true)
      try {
        const blob = await exportData(request)
        
        // Create download link
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${request.data}_export_${new Date().toISOString().split('T')[0]}.${request.format === 'excel' ? 'xlsx' : 'csv'}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast.success(`Data exported successfully as ${request.format.toUpperCase()}`)
        return blob
      } finally {
        setIsExporting(false)
      }
    },
    onError: (error) => {
      console.error('Export failed:', error)
      toast.error('Failed to export data. Please try again.')
      setIsExporting(false)
    }
  })

  const canExport = hasDownloadAccess() && exportOptions?.options.permissions.canExport

  return {
    // Data
    exportOptions,
    exportStats,
    
    // States
    isExporting: isExporting || exportMutation.isPending,
    canExport,
    
    // Actions
    getPreview: previewMutation.mutateAsync,
    exportData: exportMutation.mutateAsync,
    
    // Status
    previewLoading: previewMutation.isPending,
    previewData: previewMutation.data,
    previewError: previewMutation.error,
  }
}
