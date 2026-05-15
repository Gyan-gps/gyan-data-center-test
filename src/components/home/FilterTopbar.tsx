import React, {
  useState,
  useEffect,
  // useCallback,
  useRef,
  useCallback,
} from "react";
import {
  Button,
  Select,
  // RangeSlider,
  Loading,
} from "@/components/ui";
import { X, ChevronDown } from "lucide-react";
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

interface FilterTopbarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  // searchValue: string;
  // onSearchChange: (value: string) => void;
  isMobile?: boolean;
  onClose?: () => void;
  visibleFilters?: string[]; // array of filter names to show. If empty/undefined, show all
}

export const FilterTopbar: React.FC<FilterTopbarProps> = ({
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
  
  const [showStatus, setShowStatus] = useState(false);
  const [showOperator, setShowOperator] = useState(false);
  const [showDcTypes, setShowDcTypes] = useState(false);
  const [showTiers, setShowTiers] = useState(false);

  const statusRef = useRef<HTMLDivElement>(null);
  const operatorRef = useRef<HTMLDivElement>(null);
  const dcTypesRef = useRef<HTMLDivElement>(null);
  const tiersRef = useRef<HTMLDivElement>(null);
  // Debounced range slider state for better performance
  const [
    ,
    // tempItLoadRange
    setTempItLoadRange,
  ] = useState(filters.itLoadRange);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Geography popover state + close-on-outside-click
  const [showGeo, setShowGeo] = useState(false);
  const geoPopoverRef = useRef<HTMLDivElement>(null);

  const handleGeoOutsideClick = useCallback((e: MouseEvent) => {
    if (geoPopoverRef.current && !geoPopoverRef.current.contains(e.target as Node)) {
      setShowGeo(false);
    }
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setShowStatus(false);
      if (operatorRef.current && !operatorRef.current.contains(e.target as Node)) setShowOperator(false);
      if (dcTypesRef.current && !dcTypesRef.current.contains(e.target as Node)) setShowDcTypes(false);
      if (tiersRef.current && !tiersRef.current.contains(e.target as Node)) setShowTiers(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  useEffect(() => {
    if (showGeo) {
      document.addEventListener("mousedown", handleGeoOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleGeoOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleGeoOutsideClick);
    };
  }, [showGeo, handleGeoOutsideClick]);

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
    return () => { };
  }, [filterOptions, filters, filters.itLoadRange, onFiltersChange]);

  // Debounced range slider handler with proper cleanup
  // const handleItLoadRangeChange = useCallback(
  //   (value: [number, number]) => {
  //     setTempItLoadRange(value);
  //     if (debounceTimeoutRef.current) {
  //       clearTimeout(debounceTimeoutRef.current);
  //     }
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

 if (isLoading) {
  return (
    <div
      className={`${
        isMobile
          ? "w-80 fixed left-0 top-0 h-full shadow-xl border-r"
          : "w-full"
      } bg-white border-gray-200 flex items-center justify-center py-4`}
    >
      <Loading text="Loading filters..." />
    </div>
  );
}
    if (error) {
      return (
        <div className="w-full bg-white border-b border-gray-200 px-4 py-3">
          <span className="text-red-500 text-sm">
            Error loading filters. Please try again.
          </span>
        </div>
      );
    }

  // ─── Main render ─────────────────────────────────────────────────────────────
  return (
    <div className="w-full bg-white">
      {/* Header row — mirrors sidebar header; isMobile close button kept */}


      {!filterOptions ? (
        <div className="flex items-center px-4 py-3">
          <span className="text-gray-500 text-sm">
            Unable to load filter options
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-4 py-3 w-full min-w-0">



          {/* 1. Asset/Project Status */}
          {isFilterVisible("statuses") && (
            <div className="relative flex-1 min-w-0 max-w-[140px]" ref={statusRef}>
              <Button
                variant="outline"
                onClick={() => setShowStatus((p) => !p)}
                className="h-9 w-full justify-between gap-1 text-sm font-normal"
              >
                <span className="truncate">
                  {filters.statuses.length > 0 ? `Status (${filters.statuses.length})` : "Status"}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${showStatus ? "rotate-180" : ""}`} />
              </Button>
              {showStatus && (
                <div className="absolute z-50 top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-[200px]">
                  <Select
                    options={filterOptions.statuses.map((s) => ({ value: s, label: s }))}
                    value={filters.statuses}
                    multiple
                    onChange={(value) => onFiltersChange({ ...filters, statuses: value as string[] })}
                    placeholder="Select status..."
                  />
                </div>
              )}
            </div>
          )}

          {/* 2. Geography — single button, popover reveals Region / Country / City */}
          {(isFilterVisible("regions") ||
            isFilterVisible("countries") ||
            isFilterVisible("cities")) && (
              <div className="relative" ref={geoPopoverRef}>
                {/* <label className="block text-xs font-medium text-gray-600 mb-1">
                Geography
              </label> */}

                {/* Trigger button — shows active-selection count as a badge */}
                <Button
                  variant="outline"
                  onClick={() => setShowGeo((prev) => !prev)}
                  className="h-9 min-w-[160px] justify-between gap-2 text-sm font-normal"
                >
                  <span>
                    {filters.regions.length + filters.countries.length + filters.cities.length > 0
                      ? `Geography (${filters.regions.length + filters.countries.length + filters.cities.length})`
                      : "Geography"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${showGeo ? "rotate-180" : ""}`}
                  />
                </Button>

                {/* Popover */}
                {showGeo && (
                  <div className="absolute z-50 top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-[260px] space-y-3">
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
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Region
                              </label>
                              <Select
                                options={regions.map((region) => ({
                                  value: region,
                                  label: region,
                                }))}
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
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Country
                              </label>
                              <Select
                                options={countries.map((country) => ({
                                  value: country,
                                  label: country,
                                }))}
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
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Cities
                              </label>
                              <Select
                                options={cities.map((city) => ({
                                  value: city,
                                  label: city,
                                }))}
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
              </div>
            )}

          {/* 3. Operator */}
          {isFilterVisible("operators") && (
            <div className="relative flex-1 min-w-0 max-w-[150px]" ref={operatorRef}>
              <Button
                variant="outline"
                onClick={() => setShowOperator((p) => !p)}
                className="h-9 w-full justify-between gap-1 text-sm font-normal"
              >
                <span className="truncate">
                  {filters.operators.length > 0 ? `Operators (${filters.operators.length})` : "Operators"}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${showOperator ? "rotate-180" : ""}`} />
              </Button>
              {showOperator && (
                <div className="absolute z-50 top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-[220px]">
                  <Select
                    options={filterOptions.operators.map((o) => ({ value: o, label: o }))}
                    value={filters.operators}
                    multiple
                    searchable
                    onChange={(value) => onFiltersChange({ ...filters, operators: value as string[] })}
                    placeholder="Search operators..."
                  />
                </div>
              )}
            </div>
          )}

          {/* 4. Facility Type (dcTypes) */}
          {isFilterVisible("dcTypes") && (
            <div className="relative flex-1 min-w-0 max-w-[160px]" ref={dcTypesRef}>
              <Button
                variant="outline"
                onClick={() => setShowDcTypes((p) => !p)}
                className="h-9 w-full justify-between gap-1 text-sm font-normal"
              >
                <span className="truncate">
                  {filters.dcTypes.length > 0 ? `Facility (${filters.dcTypes.length})` : "Facility Type"}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${showDcTypes ? "rotate-180" : ""}`} />
              </Button>
              {showDcTypes && (
                <div className="absolute z-50 top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-[220px]">
                  <Select
                    options={filterOptions.dcTypes.map((d) => ({ value: d, label: d }))}
                    value={filters.dcTypes}
                    multiple
                    searchable
                    onChange={(value) => onFiltersChange({ ...filters, dcTypes: value as string[] })}
                    placeholder="Select facility types..."
                  />
                </div>
              )}
            </div>
          )}

          {/* Commissioning/Operation Year - COMMENTED OUT */}
          {/* <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Commissioning/Operation Year
            </h3>
            <RangeSlider ... />
          </div> */}

          {/* 5. Tier Certification */}
          {/* {isFilterVisible("tierLevels") && (
            <div className="relative flex-1 min-w-0 max-w-[140px]" ref={tiersRef}>
              <Button
                variant="outline"
                onClick={() => setShowTiers((p) => !p)}
                className="h-9 w-full justify-between gap-1 text-sm font-normal"
              >
                <span className="truncate">
                  {filters.tierLevels.length > 0 ? `Tiers (${filters.tierLevels.length})` : "Tiers"}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${showTiers ? "rotate-180" : ""}`} />
              </Button>
              {showTiers && (
                <div className="absolute z-50 top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-[200px]">
                  <Select
                    options={filterOptions.tierLevels.map((t) => ({ value: t, label: t }))}
                    value={filters.tierLevels}
                    multiple
                    onChange={(value) => onFiltersChange({ ...filters, tierLevels: value as string[] })}
                    placeholder="Select tiers..."
                  />
                </div>
              )}
            </div>
          )} */}

          {/* 6. IT Capacity (MW) — COMMENTED OUT */}
          {/* {isFilterVisible("itLoadRange") && (
            <div>
              <RangeSlider ... />
            </div>
          )} */}

          {/* Action Buttons */}
          <div className="flex gap-2 ml-auto shrink-0 self-end pb-0.5">
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="h-9 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 whitespace-nowrap"
            >
              Reset
            </Button>
            <Button
              onClick={onApplyFilters}
              className="h-9 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm whitespace-nowrap"
            >
              Apply Filters
            </Button>
          </div>

        </div>
      )}
    </div>
  );
};