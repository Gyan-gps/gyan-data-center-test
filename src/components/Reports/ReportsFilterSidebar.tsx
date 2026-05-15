import React, {useState, useEffect, useRef} from "react";
import { Button, Loading, Select } from "@/components/ui";
import { useQuery } from "@tanstack/react-query";
import { X, Search, ChevronDown,  } from "lucide-react";

import { getReportsFilterOptions } from "@/network";
import type { ReportFilters } from "@/network/datacenter/datacenter.types";
import { GeographySelect } from "../common/GeographySelect";
import { useCompanyFilters } from "@/hooks/useCompanyFilters";

interface ReportsFilterSidebarProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  isMobile?: boolean;
  onClose?: () => void;
}

// ── Reusable popover wrapper ──────────────────────────────────────────────────
const FilterPopover: React.FC<{
  label: string;
  count?: number;
  children: React.ReactNode;
}> = ({ label, count, children }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative shrink-0" ref={ref}>
      <Button
        variant="outline"
        onClick={() => setOpen((p) => !p)}
        className="h-9 text-sm font-normal border-gray-300 hover:border-gray-400 whitespace-nowrap justify-between gap-1"
      >
        <span className="truncate">
          {count ? `${label} (${count})` : label}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </Button>
      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-[220px]">
          {children}
        </div>
      )}
    </div>
  );
};


// ── Year ──────────────────────────────────────────────────────────────────────
const YearPopover: React.FC<{
  options: number[];
  value: number[];
  onChange: (v: number[]) => void;
  label: string;
}> = ({ options, value, onChange, label }) => (
  <FilterPopover label={label} count={value.length}>
    <Select
      options={options.sort((a, b) => b - a).map((y) => ({ value: y.toString(), label: y.toString() }))}
      value={value.map(String)}
      multiple
      searchable
      onChange={(v) => {
        const years = (Array.isArray(v) ? v : []).map(Number).filter(Boolean);
        onChange(years);
      }}
      placeholder="Select years..."
    />
  </FilterPopover>
);

// ── Geography ─────────────────────────────────────────────────────────────────
const GeoPopover: React.FC<{
  filters: ReportFilters;
  onFiltersChange: (f: ReportFilters) => void;
  count: number;
  filterFromCompany?: { hqRegions?: string[]; hqCountries?: string[] } | null;
}> = ({ filters, onFiltersChange, count, filterFromCompany }) => (
  <FilterPopover label="Geography" count={count}>
    
      <GeographySelect
      filters={filters}
      options={{
        regions: filterFromCompany?.hqRegions ?? [],
        countries: filterFromCompany?.hqCountries ?? [],
        cities: [],
      }}
    >
      {({ regions, countries }) => (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Region</label>
            <Select
              options={regions.map((r) => ({ value: r, label: r }))}
              value={filters.regions}
              multiple searchable
              onChange={(v) => onFiltersChange({ ...filters, regions: v as string[], countries: [] })}
              placeholder="Select regions..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Country</label>
            <Select
              options={countries.map((c) => ({ value: c, label: c }))}
              value={filters.countries}
              multiple searchable
              onChange={(v) => onFiltersChange({ ...filters, countries: v as string[] })}
              placeholder="Select countries..."
            />
          </div>
        </div>
      )}
    </GeographySelect>
  </FilterPopover>
);
export const ReportsFilterSidebar: React.FC<ReportsFilterSidebarProps> = ({
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  searchValue,
  onSearchChange,
  isMobile = false,
  onClose,
}) => {
  const {
    data: filterOptions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["reportsFilterOptions"],
    queryFn: getReportsFilterOptions,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
  const { data: filterFromCompany, isLoading: isLoadings, error: companyError } = useCompanyFilters();

  // Loading state
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

  // Error state
  if (error) {
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
  const geoCount = (filters.regions?.length || 0) + (filters.countries?.length || 0);

  return (
    <div className="w-full flex items-center gap-2 min-w-0">

      {/* Search */}
      <div className="relative flex-1 min-w-0 max-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search reports..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 w-full pl-9 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>

      {/* My Reports checkbox */}
      <label className="flex items-center gap-2 cursor-pointer shrink-0">
        <input
          type="checkbox"
          checked={filters.myAccessedReports || false}
          onChange={(e) => onFiltersChange({ ...filters, myAccessedReports: e.target.checked })}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700 whitespace-nowrap">My Reports</span>
      </label>


      {/* Year — button + popover */}
      {filterOptions?.publishedYears && filterOptions.publishedYears.length > 0 && (
        <YearPopover
          options={filterOptions.publishedYears}
          value={filters.publishedYears || []}
          onChange={(years) => onFiltersChange({ ...filters, publishedYears: years.length ? years : undefined })}
          label="Year"
        />
      )}

      {/* Geography — button + popover */}
      <GeoPopover filters={filters} onFiltersChange={onFiltersChange} count={geoCount}  filterFromCompany={filterFromCompany}/>

      {/* Actions */}
      <div className="flex gap-2 ml-auto shrink-0">
        <Button variant="outline" onClick={onClearFilters}
          className="h-9 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 whitespace-nowrap">
          Reset
        </Button>
        <Button onClick={onApplyFilters}
          className="h-9 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm whitespace-nowrap">
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
            {isMobile && (
              <Button variant="ghost" size="sm" className="p-2" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 border-b border-gray-200 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filter Content - Scrollable */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 sm:space-y-6 pb-15"
        style={{ overflowX: "visible" }}
      >
        {!filterOptions ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-gray-500 text-sm">
              Unable to load filter options
            </span>
          </div>
        ) : (
          <>
            {/* My Accessed Reports */}
            <div className="">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.myAccessedReports || false}
                  onChange={(e) => {
                    onFiltersChange({
                      ...filters,
                      myAccessedReports: e.target.checked,
                    });
                  }}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm font-semibold text-gray-900">
                  My Accessed Reports
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-7">
                Show only reports you have requested
              </p>
            </div>



            {/* Publication Years */}
            {filterOptions?.publishedYears &&
              filterOptions.publishedYears.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Publication Year
                  </h3>
                  <Select
                    options={
                      filterOptions.publishedYears
                        .sort((a, b) => b - a)
                        .map((year) => ({
                          value: year.toString(),
                          label: year.toString(),
                        })) || []
                    }
                    value={
                      filters.publishedYears?.map((year) => year.toString()) || []
                    }
                    multiple
                    searchable
                    onChange={(value) => {
                      const yearValues = Array.isArray(value)
                        ? value.map((v) => parseInt(v)).filter((v) => !isNaN(v))
                        : [];
                      onFiltersChange({
                        ...filters,
                        publishedYears: yearValues.length > 0 ? yearValues : undefined,
                      });
                    }}
                    placeholder="Select years..."
                  />
                </div>
              )}

            {/* Geography Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Geography
              </h3>

              <GeographySelect filters={filters}>
                {({ regions, countries }) => (
                  <>
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
                          });
                        }}
                        placeholder="Select regions..."
                      />
                    </div>

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
                        onChange={(value) => {
                          onFiltersChange({
                            ...filters,
                            countries: value as string[],
                          });
                        }}
                        placeholder="Select countries..."
                      />
                    </div>
                  </>
                )}
              </GeographySelect>
            </div>
          </>
        )}
      </div>

      {/* Apply and Reset Buttons */}
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