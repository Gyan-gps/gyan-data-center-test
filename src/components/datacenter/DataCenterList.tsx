import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { Card, CardHeader, CardTitle, CardContent, Loading, Badge } from '@/components/ui'
import { getDataCenters } from '@/network'
import type { DataCenterAsset, DataCenterFilters } from '@/network'
import { formatDataCenterStatus } from '@/utils'

interface DataCenterListProps {
  filters?: DataCenterFilters
  onSelect?: (datacenter: DataCenterAsset) => void
  showPagination?: boolean
}

export const DataCenterList: React.FC<DataCenterListProps> = ({ 
  filters = {},
  onSelect,
  showPagination = true
}) => {
  const [dataCenters, setDataCenters] = useState<DataCenterAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchDataCenters = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await getDataCenters({
        ...filters,
        page,
        limit: 20
      })

      console.log('Fetched data centers:', response)

      if (response.assets) {
        setDataCenters(response.assets)
        setTotalPages(response.totalPages || 1)
        setTotal(response.total || response.assets.length)
        setCurrentPage(page)
      } else {
        setError('Failed to load data centers')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data centers')
    } finally {
      setLoading(false)
    }
  }, [filters])

  const filtersString = useMemo(() => JSON.stringify(filters), [filters])

  useEffect(() => {
    fetchDataCenters(1)
  }, [fetchDataCenters, filtersString])

  const handlePageChange = (page: number) => {
    fetchDataCenters(page)
  }

  const navigate = useNavigate()
  
  const handleDataCenterClick = (datacenter: DataCenterAsset) => {
    if (onSelect) {
      onSelect(datacenter)
    } else {
      // If no onSelect handler provided, navigate to the detail page
      navigate(`/datacenter/${datacenter.dcId || datacenter.id}`)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loading />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            Error: {error}
            <button 
              onClick={() => fetchDataCenters(currentPage)}
              className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Results summary */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          Showing {dataCenters.length} of {total} data centers
        </p>
        {showPagination && totalPages > 1 && (
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
        )}
      </div>

      {/* Data centers grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dataCenters.map((datacenter) => (
          <div 
            key={datacenter.id}
            className={`cursor-pointer transition-all ${
              onSelect ? 'hover:scale-105' : ''
            }`}
            onClick={() => handleDataCenterClick(datacenter)}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{datacenter['Data Center Facility Name']}</CardTitle>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{datacenter['Data Center Operator']}</span>
                  <Badge variant={formatDataCenterStatus(datacenter['Data Center Status'] || '')} size="sm">
                    {datacenter['Data Center Status'] || 'N/A'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Location:</span>
                  <span>{datacenter.city}, {datacenter.country}</span>
                </div>
                
                {datacenter['Year of Commission'] && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Year Built:</span>
                    <span>{datacenter['Year of Commission']}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(1, currentPage - 2) + i
            if (pageNum > totalPages) return null
            
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-4 py-2 border rounded ${
                  pageNum === currentPage
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            )
          })}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
