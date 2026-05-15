import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { FilterSidebar } from "./FilterSidebar";
import { HomeDataTable } from "./HomeDataTable";
import { getDataCenters, getFilterOptions } from "@/network";
import { exportDataCenters } from "@/network/export/export.api";
import { useAuthStore } from "@/store/authStore";
import type {
  FilterState,
  DataCenterFilters,
  DataCenterTableRows,
} from "@/network";
import { Loading, Button } from "@/components/ui";
import { Download, Database, Filter, X } from "lucide-react";
import {
  convertFilterStateToDataCenterExport,
  downloadBlob,
  formatCompanyNameToRedirect,
  generateExportFilename,
} from "@/utils";
import SidBarHOC from "../analytics/SidBarHOC";
import { trackFileDownload } from "@/utils/ga";
import { filterInitialState, useSessionFilters } from "@/hooks/useSessionFilters";
import { FilterTopbar } from "./FilterTopbar";
// Cache structure for cursor-based pagination
interface PageCache {
  data: DataCenterTableRows[];
  offset: string | null;
  nextOffset: string | null;
}

// Query function for fetching data centers with filters
const fetchDataCenters = async ({
  filters,
  searchValue,
  pageSize,
  pageNumber
}: {
  filters: FilterState;
  searchValue: string;
  pageSize: number;
  pageNumber: number;
  filterOptions?: {
    yearRange?: { min: number; max: number };
    itLoadRange?: { min: number; max: number };
  };
}) => {
  // Convert filter state to API filters according to schema
  const apiFilters: DataCenterFilters = {};
  // Add pagination parameters - cursor-based
  apiFilters.limit = pageSize;
  apiFilters.pageNumber = pageNumber;
  // Array filters
  if (filters.statuses.length > 0) {
    apiFilters.statuses = filters.statuses;
  }
  if (filters.operators.length > 0) {
    apiFilters.operators = filters.operators;
  }
  if (filters.dcTypes.length > 0) {
    apiFilters.dcTypes = filters.dcTypes;
  }
  if (filters.tierLevels.length > 0) {
    apiFilters.tierLevels = filters.tierLevels;
  }
  if (filters.regions.length > 0) {
    apiFilters.regions = filters.regions;
  }
  if (filters.countries.length > 0) {
    apiFilters.countries = filters.countries;
  }
  if (filters.cities.length > 0) {
    apiFilters.cities = filters.cities;
  }

  // Add search if provided - maps to 'dataCenter' field as per schema
  if (searchValue && searchValue.trim()) {
    apiFilters.dataCenter = searchValue.trim();
  }

  const result = await getDataCenters(apiFilters);
  return {
    assets: result.assets || [],
    hasMore: result.hasMore || false,
    total: result.total || 0,
    totalPages: result.totalPages || 0,
  };
};

// Helper function to get the count of active filters
const getActiveFiltersCount = (
  filters: FilterState,
  filterOptions?: {
    yearRange?: { min: number; max: number };
    itLoadRange?: { min: number; max: number };
  }
) => {
  let count = 0;
  if (filters.statuses.length > 0) count++;
  if (filters.operators.length > 0) count++;
  if (filters.dcTypes.length > 0) count++;
  if (filters.tierLevels.length > 0) count++;
  if (filters.cities.length > 0) count++;
  if (filters.countries.length > 0) count++;
  if (filters.regions.length > 0) count++;
  if (
    filterOptions?.itLoadRange &&
    filters.itLoadRange &&
    (filters.itLoadRange[0] !== filterOptions.itLoadRange.min ||
      filters.itLoadRange[1] !== filterOptions.itLoadRange.max)
  )
    // console.log("Active filters count:", count, filterOptions);
  return count;
};

export const HomeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { hasDownloadAccess, user } = useAuthStore();

  // Mobile state management
  const [isMobile, setIsMobile] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Search state - separate live input from applied search
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { sessionFilters, setFiltersInSession } = useSessionFilters<FilterState>('data-center');

  // Applied filters - only updated when Apply button is clicked
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(filterInitialState);
  const [filters, setFilters] = useState<FilterState>(filterInitialState);

  useEffect(() => {
    if (sessionFilters) {
      setFilters(sessionFilters);
      setAppliedFilters(sessionFilters);
    }
  }, [sessionFilters]);

  // Cursor-based pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [, setCurrentOffset] = useState<string | null>(null);
  const [, setPageCache] = useState<Map<number, PageCache>>(new Map());

  // Cache filter options to avoid repeated API calls
  const [filterOptions, setFilterOptions] = useState<{
    yearRange?: { min: number; max: number };
    itLoadRange?: { min: number; max: number };
  } | undefined>(undefined);

  // Filter state

  // Export state
  const [isExporting, setIsExporting] = useState(false);

  // Use React Query for data fetching and caching
  const {
    data: queryData,
    isLoading: loading,
    isFetching,
  } = useQuery({
    queryKey: [
      "dataCenters",
      appliedFilters,
      searchQuery,
      currentPage,
      pageSize,
      filterOptions || {},
    ],
    queryFn: () =>
      fetchDataCenters({
        filters: appliedFilters,
        searchValue: searchQuery,
        pageNumber: currentPage,
        pageSize: pageSize,
        filterOptions,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 60 * 60 * 1000, // 1 hour (formerly cacheTime)
    refetchOnWindowFocus: false,
    retry: 1,
    placeholderData: (previousData) => previousData, // Keep previous data while loading
  });

  // Extract data from query response
  const data = useMemo(() => queryData?.assets || [], [queryData?.assets]);
  const hasMore = queryData?.hasMore || false;

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const currentIsMobile = window.innerWidth < 1024;
      setIsMobile(currentIsMobile);

      // Close mobile filter when switching to desktop
      if (!currentIsMobile) {
        setIsFilterOpen(false);
      }
    };

    // Immediately check mobile status
    checkMobile();

    // Add event listeners
    window.addEventListener("resize", checkMobile);
    window.addEventListener("focus", checkMobile);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkMobile();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("focus", checkMobile);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Initialize filter ranges from API
  useEffect(() => {
    const initializeFilters = async () => {
      try {
        const filterOptionsFromAPI = await getFilterOptions();
        if (
          filterOptionsFromAPI &&
          filterOptionsFromAPI.yearRange &&
          filterOptionsFromAPI.itLoadRange
        ) {
          setFilterOptions({
            yearRange: filterOptionsFromAPI.yearRange,
            itLoadRange: filterOptionsFromAPI.itLoadRange,
          });
          setFilters((prev) => ({
            ...prev,
            yearRange: [
              filterOptionsFromAPI.yearRange.min,
              filterOptionsFromAPI.yearRange.max,
            ],
            itLoadRange: [
              filterOptionsFromAPI.itLoadRange.min,
              filterOptionsFromAPI.itLoadRange.max,
            ],
          }));
        } else {
          // Use default values if API fails
          console.warn("Filter options not available, using defaults");
          setFilterOptions({
            yearRange: { min: 2000, max: 2030 },
            itLoadRange: { min: 0, max: 1000 },
          });
          setFilters((prev) => ({
            ...prev,
            yearRange: [2000, 2030],
            itLoadRange: [0, 1000],
          }));
        }
      } catch (error) {
        console.error("Failed to load filter options:", error);
        // Set default values on error
        setFilterOptions({
          yearRange: { min: 2000, max: 2030 },
          itLoadRange: { min: 0, max: 1000 },
        });
        setFilters((prev) => ({
          ...prev,
          yearRange: [2000, 2030],
          itLoadRange: [0, 1000],
        }));
      }
    };

    initializeFilters();
  }, []);

  const handleViewDetails = (id: string) => {
    // Navigate to data center detail page
    navigate(`/datacenter/${id}`);
  };

  const handleSearch = () => {
    // Apply trimmed input as the active search query
    setSearchQuery(searchInput.trim());
    // Reset to first page when searching
    setCurrentPage(1);
    setCurrentOffset(null);
    setPageCache(new Map());
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleCompanyDetails = (companyName: string, id: string) => {
    navigate(`/company/${formatCompanyNameToRedirect(companyName)}/${id}`);
  }

  const handleApplyFilters = () => {
    // Apply current filters and search value
    setAppliedFilters(filters);
    setFiltersInSession(filters);
    setSearchQuery(searchInput.trim());
    // Reset to first page when applying filters
    setCurrentPage(1);
    setCurrentOffset(null);
    setPageCache(new Map());
    if (isMobile) {
      setIsFilterOpen(false); // Close mobile filter after applying
    }
  };

  const handleClearFilters = async () => {
    try {
      const filterOptions = await getFilterOptions();
      const clearedFilters: FilterState = {
        statuses: [],
        operators: [],
        dcTypes: [],
        tierLevels: [],
        yearRange:
          filterOptions && filterOptions.yearRange
            ? [filterOptions.yearRange.min, filterOptions.yearRange.max]
            : [2000, 2030],
        itLoadRange:
          filterOptions && filterOptions.itLoadRange
            ? [filterOptions.itLoadRange.min, filterOptions.itLoadRange.max]
            : [0, 1000],
        cities: [],
        countries: [],
        regions: [],
      };
      setFilters(clearedFilters);
      setFiltersInSession(clearedFilters);
      setSearchInput("");
      setSearchQuery("");
      // Also clear applied filters immediately when clearing
      setAppliedFilters(clearedFilters);
      // Reset to first page when clearing filters
      setCurrentPage(1);
      setCurrentOffset(null);
      setPageCache(new Map());
      if (isMobile) {
        setIsFilterOpen(false); // Close mobile filter after clearing
      }
    } catch (error) {
      console.error("Failed to clear filters:", error);
      // Use default values if API fails
      const clearedFilters: FilterState = {
        statuses: [],
        operators: [],
        dcTypes: [],
        tierLevels: [],
        yearRange: [2000, 2030],
        itLoadRange: [0, 1000],
        cities: [],
        countries: [],
        regions: [],
      };
      setFilters(clearedFilters);
      setSearchInput("");
      setSearchQuery("");
      setAppliedFilters(clearedFilters);
      setCurrentPage(1);
      setCurrentOffset(null);
      setPageCache(new Map());
      if (isMobile) {
        setIsFilterOpen(false); // Close mobile filter after clearing
      }
    }
  };

  // Handle data center export
  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Convert current filters to export format
      const exportFilters = convertFilterStateToDataCenterExport(
        filters,
        searchInput
      );

      // Make export API call
      const blob = await exportDataCenters({
        format: "excel",
        limit: 100, // Export top 100 rows as per backend default
        filters: exportFilters,
      });

      // Generate filename and download
      const filename = generateExportFilename("datacenters", "excel");
      downloadBlob(blob, filename);
      trackFileDownload(user?.id, user?.email, filename, 'excel');
    } catch (error) {
      console.error("Export failed:", error);
      // You could add a toast notification here
    } finally {
      setIsExporting(false);
    }
  };

  // Pagination handlers
  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, []);

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      // const previousPageData = pageCache.get(currentPage - 1);
        setCurrentPage((prev) => prev - 1);
      }
    
  }, [currentPage]);

const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
    setCurrentOffset(null);
    setPageCache(new Map());
  }, []);

  const canGoPrevious = currentPage > 1;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Filter Overlay */}
      {isMobile && isFilterOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-opacity-50 z-40"
            style={{ backdropFilter: "blur(1px)" }}
            onClick={() => setIsFilterOpen(false)}
          />

          {/* Filter Drawer */}
          <div className="fixed inset-y-0 left-0 w-80 bg-white z-50 shadow-xl transform transition-transform duration-300">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFilterOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="h-full overflow-hidden">
              <FilterSidebar
                filters={filters}
                onFiltersChange={setFilters}
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
                // searchValue={searchValue}
                // onSearchChange={setSearchValue}
                isMobile={true}
                onClose={() => setIsFilterOpen(false)}
              />
            </div>
          </div>
        </>
      )}
      {/* <SidBarHOC>
        <FilterSidebar
          filters={filters}
          onFiltersChange={setFilters}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          isMobile={false}
          onClose={() => setIsFilterOpen(false)}
        />
      </SidBarHOC> */}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-2 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-md lg:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:mb-2">
                <Database className="w-5 h-5 lg:w-6 lg:h-6" />
                Data Center
              </h1>
              <p className="text-gray-600 text-xs lg:text-sm pr-4 hidden sm:block">
                Get detailed insights into global data center facilities,
                including location, capacity, certifications, operators, and
                project status. Easily search, filter, and explore active and
                upcoming data centers for strategic decision-making.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile Filter Button */}
              {isMobile && (() => {
                const activeCount = getActiveFiltersCount(appliedFilters, filterOptions) || 0;
                return (
                  <Button
                    onClick={() => setIsFilterOpen(true)}
                    className="ml-4 p-3 text-black rounded-lg shadow-sm relative"
                  >
                    <Filter className="w-4 h-4" />
                    {activeCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border border-white flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {activeCount}
                        </span>
                      </div>
                    )}
                  </Button>
                );
              })()}

              {/* Export Button - Hidden on very small screens */}
              {hasDownloadAccess() && (
                <Button
                  variant="outline"
                  className="sm:flex items-center gap-2 p-3"
                  onClick={handleExport}
                  disabled={isExporting}
                >
                  <Download
                    className={`w-4 h-4 ${isExporting ? "animate-bounce" : ""}`}
                  />
                  <span className="hidden md:inline">
                    {isExporting ? "Exporting..." : "Export"}
                  </span>
                </Button>
              )}
            </div>
          </div>
        </div>

{/* Search + Filters Bar */}
<div className="hidden lg:block bg-white border-b border-gray-200 px-4 lg:px-6 py-3">
  <div className="flex items-center gap-3">
    {/* Search */}
    <div className="flex items-center gap-2 w-[320px] shrink-0">
      <input
        type="text"
        placeholder="Search by facility name or operator..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyDown={handleSearchKeyDown}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />
      <Button
        onClick={handleSearch}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shrink-0"
      >
        Search
      </Button>
    </div>

    {/* Divider */}
    <div className="h-8 w-px bg-gray-200 shrink-0" />

    {/* Filters */}
    <div className="flex-1 min-w-0">
      <FilterTopbar
        filters={filters}
          onFiltersChange={setFilters}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          isMobile={false}
          onClose={() => setIsFilterOpen(false)}
      />
    </div>
  </div>
</div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto py-2 lg:p-6">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loading />
            </div>
          ) : (
            <HomeDataTable
              data={data}
              loading={false}
              isFetchingNextPage={isFetching}
              onViewDetails={handleViewDetails}
              onCompanyDetails={handleCompanyDetails}
              currentPage={currentPage}
              pageSize={pageSize}
              hasMore={hasMore}
              canGoPrevious={canGoPrevious}
              onNextPage={handleNextPage}
              onPreviousPage={handlePreviousPage}
              onPageSizeChange={handlePageSizeChange}
              totalPages={queryData ? queryData.totalPages : 0}
              totalDataCenters={queryData ? queryData.total : 0}
            />
          )}
        </div>
      </div>
    </div>
  );
};
