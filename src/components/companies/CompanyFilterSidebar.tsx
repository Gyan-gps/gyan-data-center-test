import { Button, Select, Loading } from "@/components/ui";
import { useCompanyFilters } from "@/hooks";
import type { CompanyFilterState } from "./types";
import { GeographySelect } from "../common/GeographySelect";
import React, { useCallback, useState, useEffect, useRef } from "react";
import { ChevronDown, X } from "lucide-react";
interface CompanyFilterSidebarProps {
  filters: CompanyFilterState;
  onFiltersChange: (filters: CompanyFilterState) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  isMobile?: boolean;
  onClose?: () => void;
}

export const CompanyFilterSidebar: React.FC<CompanyFilterSidebarProps> = ({
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  isMobile = false,
  onClose,
}) => {
  const {
    data: filterOptions,
    isLoading: isLoadingFilters,
    error: filterError,
  } = useCompanyFilters();

  const handleMultiSelectChange = useCallback(
    (field: keyof CompanyFilterState, values: string[]) => {
      onFiltersChange({
        ...filters,
        [field]: values,
      });
    },
    [filters, onFiltersChange]
  );

  const [showCompanies, setShowCompanies] = useState(false);
const [showCompanyTypes, setShowCompanyTypes] = useState(false);
const [showGeo, setShowGeo] = useState(false);

const companiesRef = useRef<HTMLDivElement>(null);
const companyTypesRef = useRef<HTMLDivElement>(null);
const geoRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const handler = (e: MouseEvent) => {
    if (companiesRef.current && !companiesRef.current.contains(e.target as Node)) setShowCompanies(false);
    if (companyTypesRef.current && !companyTypesRef.current.contains(e.target as Node)) setShowCompanyTypes(false);
    if (geoRef.current && !geoRef.current.contains(e.target as Node)) setShowGeo(false);
  };
  document.addEventListener("mousedown", handler);
  return () => document.removeEventListener("mousedown", handler);
}, []);
  // Loading state
if (isLoadingFilters) {
  return isMobile ? (
    <div className="w-80 fixed left-0 top-0 h-full bg-white shadow-xl z-50 border-r border-gray-200 p-4">
      <div className="flex items-center justify-center py-8">
        <Loading text="Loading filters..." />
      </div>
    </div>
  ) : null;
}

  // Error state
  if (filterError) {
    return isMobile ? (
      <div className="w-80 fixed left-0 top-0 h-full bg-white shadow-xl z-50 border-r border-gray-200 p-4">
        <div className="flex items-center justify-center py-8">
          <span className="text-red-500">
            Error loading filters. Please try again.
          </span>
        </div>
      </div>
    ) : null;
  }

  // ── Desktop: horizontal topbar row ────────────────────────────────────────
 if (!isMobile) {
  return (
    <div className="w-full flex items-center gap-2 px-0 py-0 min-w-0">

      {/* 1. Company Search */}
      <div className="relative flex-1 min-w-0 max-w-[160px]" ref={companiesRef}>
        <Button
          variant="outline"
          onClick={() => setShowCompanies((p) => !p)}
          className="h-9 w-full justify-between gap-1 text-sm font-normal"
        >
          <span className="truncate">
            {filters.companies.length > 0 ? `Companies (${filters.companies.length})` : "Companies"}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${showCompanies ? "rotate-180" : ""}`} />
        </Button>
        {showCompanies && (
          <div className="absolute z-50 top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-[220px]">
            <Select
              options={filterOptions?.companies.map((c) => ({ value: c, label: c })) || []}
              value={filters.companies}
              multiple
              searchable
              onChange={(value) => handleMultiSelectChange("companies", value as string[])}
              placeholder="Search companies..."
            />
          </div>
        )}
      </div>

      {/* 2. Company Type */}
      {filterOptions?.companyTypes && filterOptions.companyTypes.length > 0 && (
        <div className="relative flex-1 min-w-0 max-w-[150px]" ref={companyTypesRef}>
          <Button
            variant="outline"
            onClick={() => setShowCompanyTypes((p) => !p)}
            className="h-9 w-full justify-between gap-1 text-sm font-normal"
          >
            <span className="truncate">
              {filters.companyTypes.length > 0 ? `Type (${filters.companyTypes.length})` : "Type"}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${showCompanyTypes ? "rotate-180" : ""}`} />
          </Button>
          {showCompanyTypes && (
            <div className="absolute z-50 top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-[200px]">
              <Select
                options={filterOptions.companyTypes.map((t) => ({
                  value: t,
                  label: t.charAt(0).toUpperCase() + t.slice(1),
                }))}
                value={filters.companyTypes}
                multiple
                onChange={(value) => handleMultiSelectChange("companyTypes", value as string[])}
                placeholder="Company type..."
              />
            </div>
          )}
        </div>
      )}

      {/* 3. Geography */}
      <div className="relative flex-1 min-w-0 max-w-[150px]" ref={geoRef}>
        <Button
          variant="outline"
          onClick={() => setShowGeo((p) => !p)}
          className="h-9 w-full justify-between gap-1 text-sm font-normal"
        >
          <span className="truncate">
            {filters.hqRegions.length + filters.hqCountries.length + filters.hqCities.length > 0
              ? `Geography (${filters.hqRegions.length + filters.hqCountries.length + filters.hqCities.length})`
              : "Geography"}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${showGeo ? "rotate-180" : ""}`} />
        </Button>
        {showGeo && (
          <div className="absolute z-50 top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-[260px] space-y-3">
            <GeographySelect
                filters={{ regions: filters.hqRegions, countries: filters.hqCountries, cities: filters.hqCities }}
                options={{
                  regions: filterOptions.hqRegions ?? [],
                  countries: filterOptions.hqCountries ?? [],
                  cities: filterOptions.hqCities ?? [],
                }}
              >
              {({ regions, countries, cities, isCountriesEnabled, isCitiesEnabled }) => (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Region</label>
                    <Select
                      options={regions.map((r) => ({ value: r, label: r }))}
                      value={filters.hqRegions}
                      multiple
                      searchable
                      onChange={(value) => onFiltersChange({ ...filters, hqRegions: value as string[], hqCountries: [], hqCities: [] })}
                      placeholder="Select regions..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Country</label>
                    <Select
                      options={countries.map((c) => ({ value: c, label: c }))}
                      value={filters.hqCountries}
                      multiple
                      searchable
                      disabled={!isCountriesEnabled}
                      onChange={(value) => onFiltersChange({ ...filters, hqCountries: value as string[], hqCities: [] })}
                      placeholder={isCountriesEnabled ? "Select countries..." : "Select regions first"}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                    <Select
                      options={cities.map((c) => ({ value: c, label: c }))}
                      value={filters.hqCities}
                      multiple
                      searchable
                      disabled={!isCitiesEnabled}
                      onChange={(value) => onFiltersChange({ ...filters, hqCities: value as string[] })}
                      placeholder={isCitiesEnabled ? "Select cities..." : "Select countries first"}
                    />
                  </div>
                </>
              )}
            </GeographySelect>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 ml-auto shrink-0">
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
  );
}

  // ── Mobile/Tablet: original sidebar (100% unchanged) ──────────────────────
  return (
    <div className="w-80 fixed left-0 top-0 h-full bg-white shadow-xl z-50 border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <div className="flex items-center gap-2">
            {isMobile && onClose && (
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
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
        {!filterOptions ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-gray-500 text-sm">
              Unable to load filter options
            </span>
          </div>
        ) : (
          <>
            {/* 1. Company Search */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Company Search
              </h3>
              <Select
                options={
                  filterOptions?.companies.map((company) => ({
                    value: company,
                    label: company,
                  })) || []
                }
                value={filters.companies}
                multiple
                searchable
                onChange={(value) => {
                  handleMultiSelectChange("companies", value as string[]);
                }}
                placeholder="Search companies..."
              />
            </div>

            {/* 2. Company Types */}
            {filterOptions?.companyTypes &&
              filterOptions.companyTypes.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Company Type
                  </h3>
                  <div className="space-y-2">
                    {filterOptions.companyTypes.map((type) => (
                      <label
                        key={type}
                        className="flex items-center cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.companyTypes.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              onFiltersChange({
                                ...filters,
                                companyTypes: [...filters.companyTypes, type],
                              });
                            } else {
                              onFiltersChange({
                                ...filters,
                                companyTypes: filters.companyTypes.filter(
                                  (t) => t !== type
                                ),
                              });
                            }
                          }}
                          className="mr-3 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

            {/* 3. Geography Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Geography
              </h3>

              <GeographySelect
                filters={{ regions: filters.hqRegions, countries: filters.hqCountries, cities: filters.hqCities }}
                options={{
                  regions: filterOptions.hqRegions ?? [],
                  countries: filterOptions.hqCountries ?? [],
                  cities: filterOptions.hqCities ?? [],
                }}
              >
                {({ regions, countries, cities, isCountriesEnabled, isCitiesEnabled }) => (
                  <>
                    {/* Regions */}
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        Regions
                      </label>
                      <Select
                        options={
                          regions.map((region) => ({
                            value: region,
                            label: region,
                          })) || []
                        }
                        value={filters.hqRegions}
                        multiple
                        searchable
                        onChange={(value) => {
                          onFiltersChange({
                            ...filters,
                            hqRegions: value as string[],
                            hqCountries: [],
                            hqCities: [],
                          });
                        }}
                        placeholder="Select regions..."
                      />
                    </div>

                    {/* Countries */}
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        Countries
                      </label>
                      <Select
                        options={
                          countries.map((country) => ({
                            value: country,
                            label: country,
                          })) || []
                        }
                        value={filters.hqCountries}
                        multiple
                        searchable
                        disabled={!isCountriesEnabled}
                        onChange={(value) => {
                          onFiltersChange({
                            ...filters,
                            hqCountries: value as string[],
                            hqCities: [],
                          });
                        }}
                        placeholder={
                          isCountriesEnabled
                            ? "Select countries..."
                            : "Select regions first"
                        }
                      />
                    </div>

                    {/* Cities */}
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
                        value={filters.hqCities}
                        multiple
                        searchable
                        disabled={!isCitiesEnabled}
                        onChange={(value) => {
                          onFiltersChange({
                            ...filters,
                            hqCities: value as string[],
                          });
                        }}
                        placeholder={
                          isCitiesEnabled
                            ? "Select cities..."
                            : "Select countries first"
                        }
                      />
                    </div>
                  </>
                )}
              </GeographySelect>
            </div>
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