import React, { useState, useEffect } from 'react'
import { Button, Input, Loading, Select } from '@/components/ui'
import { getFilterOptions } from '@/network'
import type { FilterOptions, ITLoadFilters } from '@/network'

interface ITLoadFilterSidebarProps {
  filters: ITLoadFilters
  onFiltersChange: (filters: ITLoadFilters) => void
  onApplyFilters: () => void
  onClearFilters: () => void
}

export const ITLoadFilterSidebar: React.FC<ITLoadFilterSidebarProps> = ({
  filters,
  onFiltersChange,
  onApplyFilters,
  // onClearFilters
}) => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        setLoading(true)
        const options = await getFilterOptions()
        setFilterOptions(options)
      } catch (error) {
        console.error('Failed to load filter options:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFilterOptions()
  }, [])

  // const hasActiveFilters = () => {
  //   return (
  //     !!filters.region ||
  //     !!filters.country ||
  //     !!filters.operator ||
  //     !!filters.year ||
  //     filters.forecast !== undefined ||
  //     !!filters.minYear ||
  //     !!filters.maxYear
  //   )
  // }

  if (!filterOptions && loading) {
    return (
      <div className="w-80 bg-white border-r border-gray-200 p-4 h-screen">
        <div className="flex items-center justify-center py-8">
          <Loading text="Loading filters..." />
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          {/* {hasActiveFilters() && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-red-600 hover:text-red-700 text-xs px-2"
              onClick={onClearFilters}
            >
              Clear all filters
            </Button>
          )} */}
        </div>
      </div>

      {/* Filter Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {!filterOptions ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-gray-500 text-sm">Unable to load filter options</span>
          </div>
        ) : (
          <>
            {/* Region Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region
              </label>
              <Input
                type="text"
                placeholder="e.g. North America"
                value={filters.regions || ''}
                onChange={(e) => onFiltersChange({ ...filters, regions: e.target.value || undefined })}
              />
            </div>

            {/* Country Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <Select
                options={[{ value: '', label: 'All Countries' }, ...filterOptions.countries.map(country => ({ value: country, label: country }))]}
                value={filters.countries || ''}
                onChange={(value) => {
                  onFiltersChange({ ...filters, countries: value as string || undefined })
                }}
                placeholder="All Countries"
              />
            </div>

            {/* Operator Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operator
              </label>
              <Input
                type="text"
                placeholder="e.g. Amazon, Google"
                value={filters.operator || ''}
                onChange={(e) => onFiltersChange({ ...filters, operator: e.target.value || undefined })}
              />
            </div>

            {/* Year Range */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Year Range</h3>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Min Year
                </label>
                <Input
                  type="number"
                  placeholder="2016"
                  min="2016"
                  max="2030"
                  value={filters.minYear || ''}
                  onChange={(e) => onFiltersChange({ 
                    ...filters, 
                    minYear: e.target.value ? Number(e.target.value) : undefined 
                  })}
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Max Year
                </label>
                <Input
                  type="number"
                  placeholder="2030"
                  min="2016"
                  max="2030"
                  value={filters.maxYear || ''}
                  onChange={(e) => onFiltersChange({ 
                    ...filters, 
                    maxYear: e.target.value ? Number(e.target.value) : undefined 
                  })}
                />
              </div>
            </div>

            {/* Specific Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specific Year
              </label>
              <Input
                type="number"
                placeholder="e.g. 2024"
                min="2016"
                max="2030"
                value={filters.year || ''}
                onChange={(e) => onFiltersChange({ 
                  ...filters, 
                  year: e.target.value ? Number(e.target.value) : undefined 
                })}
              />
            </div>

            {/* Data Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Type
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={filters.forecast === undefined ? '' : filters.forecast.toString()}
                onChange={(e) => onFiltersChange({ 
                  ...filters, 
                  forecast: e.target.value === '' ? undefined : e.target.value === 'true' 
                })}
              >
                <option value="">All Data</option>
                <option value="false">Actual Only</option>
                <option value="true">Forecast Only</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={filters.sortBy || 'year'}
                onChange={(e) => onFiltersChange({ 
                  ...filters, 
                  sortBy: e.target.value as 'dataCenter' || 'dataCenter' 
                })}
              >
                <option value="year">Year</option>
                <option value="operator">Operator</option>
                <option value="datacenter">Data Center</option>
                <option value="country">Country</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort Order
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={filters.sortOrder || 'asc'}
                onChange={(e) => onFiltersChange({ 
                  ...filters, 
                  sortOrder: e.target.value as 'asc' | 'desc' || undefined 
                })}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </>
        )}
      </div>

      {/* Footer with Action Buttons */}
      <div className="p-4 border-t border-gray-200 shrink-0">
        <Button 
          onClick={onApplyFilters}
          className="w-full"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  )
}
