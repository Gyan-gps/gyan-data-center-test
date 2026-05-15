import React, {
  useState,
  useEffect,
  // useCallback,
  useRef,
} from "react";
import {
  Button,
  Select,
  // RangeSlider,
  Loading,
} from "@/components/ui";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { getFilterOptions } from "@/network";
import type {
  // FilterOptions,
  FilterState,
} from "@/network/datacenter/datacenter.types";
import { GeographySelect } from "../common/GeographySelect";

type FilterType =
  | "statuses"
  | "regions"
  | "countries"
  | "cities"
  | "operators"
  | "dcTypes"
  | "tierLevels"
  | "itLoadRange";

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  // searchValue: string;
  // onSearchChange: (value: string) => void;
  isMobile?: boolean;
  onClose?: () => void;
  visibleFilters?: string[]; // New prop: array of filter names to show. If empty/undefined, show all
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  // searchValue,
  // onSearchChange,
  isMobile = false,
  onClose,
  visibleFilters = [], // Default to empty array (show all)
}) => {
  // Use React Query to fetch and cache filter options
  const {
    data: filterOptions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["filterOptions"],
    queryFn: getFilterOptions,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep data in cache for 30 minutes (formerly cacheTime)
  });

  // Debounced range slider state for better performance
  const [
    ,
    // tempItLoadRange
    setTempItLoadRange,
  ] = useState(filters.itLoadRange);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to check if a filter should be visible
  const isFilterVisible = (filterType: FilterType): boolean => {
    if (!visibleFilters || visibleFilters.length === 0) {
      return true; // Show all filters if no specific filters are specified
    }
    return visibleFilters.includes(filterType);
  };

  // Initialize range slider values properly to prevent overflow
  useEffect(() => {
    if (
      filterOptions &&
      filters.itLoadRange &&
      (filters.itLoadRange[0] === undefined ||
        filters.itLoadRange[1] === undefined ||
        filters.itLoadRange[1] > filterOptions.itLoadRange.max ||
        filters.itLoadRange[0] < filterOptions.itLoadRange.min)
    ) {
      const newRange: [number, number] = [
        filterOptions.itLoadRange.min,
        filterOptions.itLoadRange.max,
      ];
      setTempItLoadRange(newRange);
      onFiltersChange({
        ...filters,
        itLoadRange: newRange,
      });
    }
    return () => {};
  }, [filterOptions, filters, filters.itLoadRange, onFiltersChange]);

  // Debounced range slider handler with proper cleanup
  // const handleItLoadRangeChange = useCallback(
  //   (value: [number, number]) => {
  //     setTempItLoadRange(value);

  //     // Clear previous timeout
  //     if (debounceTimeoutRef.current) {
  //       clearTimeout(debounceTimeoutRef.current);
  //     }

  //     // Set new timeout
  //     debounceTimeoutRef.current = setTimeout(() => {
  //       onFiltersChange({ ...filters, itLoadRange: value });
  //     }, 300);
  //   },
  //   [filters, onFiltersChange]
  // );

  // Sync temp range with actual filter when filters change externally
  useEffect(() => {
    if (
      filters.itLoadRange &&
      Array.isArray(filters.itLoadRange) &&
      filters.itLoadRange.length === 2
    ) {
      setTempItLoadRange(filters.itLoadRange);
    } else if (filterOptions?.itLoadRange) {
      // Fallback to filter options if filters.itLoadRange is invalid
      const fallbackRange: [number, number] = [
        filterOptions.itLoadRange.min,
        filterOptions.itLoadRange.max,
      ];
      setTempItLoadRange(fallbackRange);
    }
  }, [filters.itLoadRange, filterOptions?.itLoadRange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // const hasActiveFilters = () => {
  //   return filters.regions.length > 0 ||
  //          filters.countries.length > 0 ||
  //          filters.operators.length > 0 ||
  //          filters.statuses.length > 0 ||
  //          filters.tierLevels.length > 0 ||
  //          (filterOptions &&
  //           (filters.yearRange[0] !== filterOptions?.yearRange?.min ||
  //            filters.yearRange[1] !== filterOptions?.yearRange?.max)) ||
  //          (filterOptions &&
  //           (filters.itLoadRange[0] !== filterOptions?.itLoadRange?.min ||
  //            filters.itLoadRange[1] !== filterOptions?.itLoadRange?.max)) ||
  //          searchValue.trim() !== '';
  // };

  if (isLoading) {
    return (
      <div
        className={`${
          isMobile
            ? "w-80 fixed left-0 top-0 h-full bg-white shadow-xl z-50"
            : "w-80"
        } bg-white border-r border-gray-200 p-4 h-screen`}
      >
        <div className="flex items-center justify-center py-8">
          <Loading text="Loading filters..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`${
          isMobile
            ? "w-80 fixed left-0 top-0 h-full bg-white shadow-xl z-50"
            : "w-80"
        } bg-white border-r border-gray-200 p-4 h-screen`}
      >
        <div className="flex items-center justify-center py-8">
          <span className="text-red-500">
            Error loading filters. Please try again.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${
        isMobile
          ? "w-80 fixed left-0 top-0 h-full bg-white shadow-xl z-50"
          : "w-80 h-screen"
      } bg-white border-r border-gray-200 flex flex-col`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <div className="flex items-center gap-2">
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                className="p-2"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Content - Scrollable */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 sm:space-y-6 pb-28"
        style={{
          overflowX: "visible",
        }}
      >
        {!filterOptions ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-gray-500 text-sm">
              Unable to load filter options
            </span>
          </div>
        ) : (
          <>
            {/* 1. Asset/Project Status */}
            {isFilterVisible("statuses") && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Data Center Status
                </h3>
                <div className="space-y-2">
                  {filterOptions?.statuses.map((status) => (
                    <label
                      key={status}
                      className="flex items-center cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.statuses.includes(status)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            onFiltersChange({
                              ...filters,
                              statuses: [...filters.statuses, status],
                            });
                          } else {
                            onFiltersChange({
                              ...filters,
                              statuses: filters.statuses.filter(
                                (s) => s !== status
                              ),
                            });
                          }
                        }}
                        className="mr-3 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{status}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Geography Section */}
            {(isFilterVisible("regions") ||
              isFilterVisible("countries") ||
              isFilterVisible("cities")) && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Geography
                </h3>
                  <GeographySelect
                    filters={{ regions: filters.regions, countries: filters.countries, cities: filters.cities }}
                    options={{
                      regions: filterOptions.regions ?? [],
                      countries: filterOptions.countries ?? [],
                      cities: filterOptions.cities ?? [],
                    }}
                  >
                  {({ regions, countries, cities, isCountriesEnabled, isCitiesEnabled }) => (
                    <>
                      {/* Region */}
                      {isFilterVisible("regions") && (
                        <div className="mb-4">
                          <label className="block text-xs font-medium text-gray-600 mb-2">
                            Region
                          </label>
                          <Select
                            options={
                              regions.map((region) => ({
                                value: region,
                                label: region,
                              })) || []
                            }
                            value={filters.regions}
                            multiple
                            searchable
                            onChange={(value) => {
                              onFiltersChange({
                                ...filters,
                                regions: value as string[],
                                countries: [],
                                cities: [],
                              });
                            }}
                            placeholder="Select regions..."
                          />
                        </div>
                      )}

                      {/* Country */}
                      {isFilterVisible("countries") && (
                        <div className="mb-4">
                          <label className="block text-xs font-medium text-gray-600 mb-2">
                            Country
                          </label>
                          <Select
                            options={
                              countries.map((country) => ({
                                value: country,
                                label: country,
                              })) || []
                            }
                            value={filters.countries}
                            multiple
                            searchable
                            disabled={!isCountriesEnabled}
                            onChange={(value) => {
                              onFiltersChange({
                                ...filters,
                                countries: value as string[],
                                cities: [],
                              });
                            }}
                            placeholder={
                              isCountriesEnabled
                                ? "Select countries..."
                                : "Select regions first"
                            }
                          />
                        </div>
                      )}

                      {/* Cities */}
                      {isFilterVisible("cities") && (
                        <div className="mb-4">
                          <label className="block text-xs font-medium text-gray-600 mb-2">
                            Cities
                          </label>
                          <Select
                            options={
                              cities.map((city) => ({
                                value: city,
                                label: city,
                              })) || []
                            }
                            value={filters.cities}
                            multiple
                            searchable
                            disabled={!isCitiesEnabled}
                            onChange={(value) => {
                              onFiltersChange({
                                ...filters,
                                cities: value as string[],
                              });
                            }}
                            placeholder={
                              isCitiesEnabled
                                ? "Select cities..."
                                : "Select countries first"
                            }
                          />
                        </div>
                      )}
                    </>
                  )}
                </GeographySelect>
              </div>
            )}

            {/* 3. Data_Center_Operator Section */}
            {isFilterVisible("operators") && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Operator
                </h3>
                <Select
                  options={
                    filterOptions?.operators.map((operator) => ({
                      value: operator,
                      label: operator,
                    })) || []
                  }
                  value={filters.operators}
                  multiple
                  searchable
                  onChange={(value) =>
                    onFiltersChange({
                      ...filters,
                      operators: value as string[],
                    })
                  }
                  placeholder="Search operators..."
                />
              </div>
            )}

            {/* 4. Facility Type (dcTypes) */}
            {isFilterVisible("dcTypes") && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Facility Type
                </h3>
                <Select
                  options={
                    filterOptions?.dcTypes.map((dcType) => ({
                      value: dcType,
                      label: dcType,
                    })) || []
                  }
                  value={filters.dcTypes}
                  multiple
                  searchable
                  onChange={(value) =>
                    onFiltersChange({ ...filters, dcTypes: value as string[] })
                  }
                  placeholder="Select facility types..."
                />
              </div>
            )}

            {/* Commissioning/Operation Year - COMMENTED OUT */}
            {/* <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Commissioning/Operation Year
              </h3>
              <div className="space-y-3">
                <RangeSlider
                  min={filterOptions?.yearRange?.min || 2000}
                  max={filterOptions?.yearRange?.max || 2030}
                  value={filters.yearRange}
                  onChange={(value) =>
                    onFiltersChange({ ...filters, yearRange: value })
                  }
                  step={1}
                  formatValue={(value) => value.toString()}
                />
              </div>
            </div> */}

            {/* 5.Data Center Tier Level */}
            {/* {isFilterVisible("tierLevels") && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Tier Certification
                </h3>
                <div className="space-y-2">
                  {filterOptions?.tierLevels.map((tier) => (
                    <label
                      key={tier}
                      className="flex items-center cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.tierLevels.includes(tier)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            onFiltersChange({
                              ...filters,
                              tierLevels: [...filters.tierLevels, tier],
                            });
                          } else {
                            onFiltersChange({
                              ...filters,
                              tierLevels: filters.tierLevels.filter(
                                (t) => t !== tier
                              ),
                            });
                          }
                        }}
                        className="mr-3 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{tier}</span>
                    </label>
                  ))}
                </div>
              </div>
            )} */}

            {/* 6. IT Capacity (MW) */}
            {/* {isFilterVisible("itLoadRange") && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  IT Capacity (MW)
                </h3>
                <div className="space-y-3">
                  <RangeSlider
                    min={filterOptions?.itLoadRange.min || 0}
                    max={filterOptions?.itLoadRange.max || 100}
                    value={
                      tempItLoadRange || [
                        filterOptions?.itLoadRange.min || 0,
                        filterOptions?.itLoadRange.max || 100,
                      ]
                    }
                    onChange={handleItLoadRangeChange}
                    step={0.1}
                    formatValue={(value) => `${value} MW`}
                  />
                </div>
              </div>
            )} */}
          </>
        )}
      </div>

      {/* Apply and Reset Buttons - Sticky to bottom of viewport */}
      <div className="sticky bottom-0 p-4 border-t border-gray-200 bg-white shadow-lg shrink-0 z-10">
        <div className="flex gap-3 w-full h-14">
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="flex-1 h-full text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          >
            Reset
          </Button>
          <Button
            onClick={onApplyFilters}
            className="flex-1 h-full text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};
