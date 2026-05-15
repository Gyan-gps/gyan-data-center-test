import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CompanyFilterSidebar } from "./CompanyFilterSidebar";
import { CompanyDataTable } from "./CompanyDataTable";
import { getCompanies } from "@/network";
// import { exportCompanies } from "@/network/export/export.api";
import type { CompanyFilters, CompanyListResponse } from "@/network";
import type { CompanyFilterState } from "./types";
// import type { ExportCompanyRequest } from "@/network/export/export.types";
import { Loading, Button, Input } from "@/components/ui";
import {
  // Download,
  Building,
  Filter,
  X,
} from "lucide-react";
// import { downloadBlob } from "@/utils";
// import { useAuthStore } from "@/store/authStore";
import SidBarHOC from "../analytics/SidBarHOC";
// import { trackFileDownload } from '@/utils/ga';
import {
  companyFilterInitialState,
  useSessionFilters,
} from "@/hooks/useSessionFilters";

// Cache structure for pagination
// interface PageCache {
//   data: APICompany[];
//   offset: string | null;
//   nextOffset: string | null;
// }

// Helper function to get the count of active company filters
const getActiveCompanyFiltersCount = (filters: CompanyFilterState) => {
  let count = 0;
  if (filters.companies.length > 0) count++;
  if (filters.companyTypes.length > 0) count++;
  if (filters.hqCountries.length > 0) count++;
  if (filters.hqRegions.length > 0) count++;
  if (filters.hqCities.length > 0) count++;
  return count;
};

export const CompanyDashboard: React.FC = () => {
  // const { hasDownloadAccess, user } = useAuthStore();

  const { sessionFilters, setFiltersInSession } =
    useSessionFilters<CompanyFilterState>("company");

  // Mobile state management
  const [isMobile, setIsMobile] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Search state - separate live input from applied search
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Offset-based pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  // const [currentOffset, setCurrentOffset] = useState<string | null>(null);
  // const [pageCache, setPageCache] = useState<Map<number, PageCache>>(new Map());

  // Export state
  // const [isExporting, setIsExporting] = useState(false);

  // Separate UI filters from applied filters
  const [filters, setFilters] = useState<CompanyFilterState>(
    companyFilterInitialState
  );
  const [appliedFilters, setAppliedFilters] = useState<CompanyFilterState>(
    companyFilterInitialState
  );

  // Sync filters from URL on mount or when they change
  useEffect(() => {
    setFilters(sessionFilters);
    setAppliedFilters(sessionFilters);
  }, [sessionFilters]);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      const currentIsMobile = window.innerWidth < 768;
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

  // Convert CompanyFilterState to CompanyFilters for API calls
  const convertFiltersToAPI = useCallback(
    (
      filterState: CompanyFilterState,
      offset: string | null,
      limit: number,
      searchKeyword?: string
    ): CompanyFilters => {
      return {
        // offset: offset ?? undefined,
        limit,
        searchKeyword: searchKeyword || undefined,
        // Use the direct filter fields that match the API
        companies:
          filterState.companies.length > 0 ? filterState.companies : undefined,
        companyTypes:
          filterState.companyTypes.length > 0
            ? filterState.companyTypes
            : undefined,
        hqCountries:
          filterState.hqCountries.length > 0
            ? filterState.hqCountries
            : undefined,
        hqRegions:
          filterState.hqRegions.length > 0 ? filterState.hqRegions : undefined,
        hqCities:
          filterState.hqCities.length > 0 ? filterState.hqCities : undefined,
        sortBy: "name", // Default sort
        sortOrder: "asc", // Default order
      };
    },
    []
  );

  // Create query key for caching
  const queryKey = [
    "companies",
    appliedFilters,
    currentPage,
    pageSize,
    searchQuery,
  ];

  // Use React Query for data fetching and caching
  const {
    data: companiesData,
    isLoading: loading,
    isFetching,
    error: queryError,
    refetch,
  } = useQuery<CompanyListResponse, Error>({
    queryKey,
    queryFn: async () => {
      const apiFilters = {
        ...convertFiltersToAPI(appliedFilters, null, pageSize, searchQuery),
        page: currentPage,
        limit: pageSize,
      };

      return await getCompanies(apiFilters);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    retry: 1,
    placeholderData: (previousData: CompanyListResponse | undefined) =>
      previousData, // Replaces keepPreviousData for React Query v5
  });

  // Extract data from query response
  const companies = useMemo(
    () => companiesData?.companies || [],
    [companiesData?.companies]
  );
  // const hasMore = companiesData?.hasMore || false;
  // const totalInCurrentPage = companiesData?.total || 0;
  const hasMore = companiesData?.hasMore ?? false;
  const totalInCurrentPage = companiesData?.companies?.length ?? 0;
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : "Failed to load companies"
    : null;

  // Handle filter changes
  const handleFiltersChange = (newFilters: CompanyFilterState) => {
    setFilters(newFilters);
  };

  // Handle search
  const handleSearch = () => {
    // Apply trimmed input as the active search query
    setSearchQuery(searchInput.trim());
    // Reset to first page when searching
    setCurrentPage(1);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Apply filters
  const handleApplyFilters = () => {
    setAppliedFilters(filters); // Apply the current filter state - this will trigger useEffect
    setFiltersInSession(filters); // Update the session storage with new filters
    setSearchQuery(searchInput.trim());
    setCurrentPage(1); // Reset to first page
    // setCurrentOffset(null); // Reset to first page (null = no offset)
    // setPageCache(new Map()); // Clear cache
    // Remove manual fetchCompanies call - useEffect will handle it automatically
    if (isMobile) {
      setIsFilterOpen(false);
    }
  };

  // Clear filters
  const handleClearFilters = () => {
    const clearedFilters: CompanyFilterState = {
      companies: [],
      companyTypes: [],
      hqCountries: [],
      hqRegions: [],
      hqCities: [],
    };
    setFilters(clearedFilters);
    setFiltersInSession(clearedFilters); // Update session storage to clear filters
    setAppliedFilters(clearedFilters); // Also clear applied filters - this will trigger useEffect
    setSearchInput("");
    setSearchQuery("");
    setCurrentPage(1); // Reset to first page
    // setCurrentOffset(null); // Reset to first page (null = no offset)
    // setPageCache(new Map()); // Clear cache
    // Remove manual fetchCompanies call - useEffect will handle it automatically
    if (isMobile) {
      setIsFilterOpen(false);
    }
  };

  // Handle next page navigation
  const handleNextPage = useCallback(() => {
    if (companiesData?.hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [companiesData?.hasMore]);

  // Handle previous page navigation
  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  // Handle page size change (resets to page 1)
  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
    // setCurrentOffset(null); // Reset to first page (null = no offset)
    // setPageCache(new Map()); // Clear cache when page size changes
  }, []);

  // Can go to previous page
  const canGoPrevious = currentPage > 1;

  // Handle view details (for the "View" button in table)
  // const handleViewDetails = (id: string) => {
  //   // This could navigate to a company detail page or show a modal
  //   console.log("View company details:", id);
  // };

  // Handle export
  // const handleExport = async () => {
  //   try {
  //     setIsExporting(true);
  //     const apiFilters = convertFiltersToAPI(appliedFilters, null, 1000); // Get first 1000 for export

  //     // Convert to export format
  //     const exportRequest: ExportCompanyRequest = {
  //       format: "excel",
  //       filters: {
  //         sortBy: apiFilters.sortBy,
  //         sortOrder: apiFilters.sortOrder,
  //         companies: apiFilters.companies,
  //         companyTypes: apiFilters.companyTypes,
  //         hqCountries: apiFilters.hqCountries,
  //         hqRegions: apiFilters.hqRegions,
  //         hqCities: apiFilters.hqCities,
  //         // ...
  //         // Add other company-specific filters as needed
  //       },
  //     };

  //     const blob = await exportCompanies(exportRequest);
  //     const timestamp = new Date()
  //       .toISOString()
  //       .replace(/[:.]/g, "-")
  //       .split("T")[0];
  //     const filename = `companies_export_${timestamp}.xlsx`;
  //     downloadBlob(blob, filename);
  //     trackFileDownload(user?.id, user?.email,filename, 'excel');
  //   } catch (error) {
  //     console.error("Export failed:", error);
  //     // You might want to show a toast notification here
  //   } finally {
  //     setIsExporting(false);
  //   }
  // };

  if (error && !companies.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-2">Error</div>
            <div className="text-gray-600 mb-4">{error}</div>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Filter Overlay */}
      {isMobile && isFilterOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-opacity-50 z-40"
            onClick={() => setIsFilterOpen(false)}
            style={{ backdropFilter: "blur(1px)" }}
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
              <CompanyFilterSidebar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
                isMobile={true}
                onClose={() => setIsFilterOpen(false)}
              />
            </div>
          </div>
        </>
      )}
      {/* <SidBarHOC>
        <CompanyFilterSidebar
          filters={filters}
          onFiltersChange={handleFiltersChange}
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
                <Building className="w-5 h-5 lg:w-6 lg:h-6" />
                Companies
              </h1>
              <p className="text-gray-600 text-xs lg:text-sm pr-4 hidden sm:block">
                Discover key data center Owners/Operators. View company
                profiles, portfolios, and project involvements all in one place.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile Filter Button */}
              {isMobile && (
                <Button
                  onClick={() => setIsFilterOpen(true)}
                  className="p-3 text-black rounded-lg shadow-sm relative"
                >
                  <Filter className="w-4 h-4" />
                  {getActiveCompanyFiltersCount(appliedFilters) > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border border-white flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {getActiveCompanyFiltersCount(appliedFilters)}
                      </span>
                    </div>
                  )}
                </Button>
              )}

              {/* Export Button - Hidden on very small screens */}
              {/* {hasDownloadAccess() && (
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
              )} */}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {/* <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3">
          <div className="w-full max-w-md">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search by company name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <Button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Search
              </Button>
            </div>
          </div>
        </div> */}
        <div className="hidden lg:block bg-white border-b border-gray-200 px-4 lg:px-6 py-3">
  <div className="flex items-center gap-3">

    {/* Search */}
    <div className="flex items-center gap-2 w-[320px] shrink-0">
      <input
        type="text"
        placeholder="Search by company name..."
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
      <CompanyFilterSidebar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />
    </div>

  </div>
</div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto py-2 lg:p-6">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loading />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Company Data Table */}
              <CompanyDataTable
                data={companies}
                loading={loading}
                isFetchingNextPage={isFetching && !loading}
                hasMore={hasMore}
                currentPage={currentPage}
                pageSize={pageSize}
                totalInCurrentPage={totalInCurrentPage}
                onNextPage={handleNextPage}
                onPreviousPage={handlePreviousPage}
                onPageSizeChange={handlePageSizeChange}
                canGoPrevious={canGoPrevious}
                // onViewDetails={handleViewDetails}
                totalCompanies={companiesData?.total || 0}
                totalPages={companiesData?.totalPages || 0}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
