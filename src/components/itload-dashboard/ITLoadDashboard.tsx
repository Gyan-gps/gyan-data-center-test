import React, { useState, useEffect } from "react";
import { Download, Server, Filter } from "lucide-react";
import { Button } from "@/components/ui";
import { ITLoadTable } from "./ITLoadTable";
import { ITLoadSummaryGraph } from "./ITLoadSummaryGraph";
import { FilterSidebar } from "../home/FilterSidebar";
import { exportITLoad } from "@/network/export/export.api";
import type { FilterState } from "@/network";
import { useAuthStore } from "@/store/authStore";
import {
  convertFilterStateToITLoadFilters,
  convertITLoadFiltersToExport,
  downloadBlob,
  generateExportFilename,
} from "@/utils";

// Helper function to get the count of active filters
const getActiveFiltersCount = (filters: FilterState) => {
  let count = 0;
  if (filters.statuses.length > 0) count++;
  if (filters.operators.length > 0) count++;
  if (filters.dcTypes.length > 0) count++;
  if (filters.tierLevels.length > 0) count++;
  if (filters.cities.length > 0) count++;
  if (filters.countries.length > 0) count++;
  if (filters.regions.length > 0) count++;
  return count;
};

export const ITLoadDashboard: React.FC = () => {
  const { hasDownloadAccess } = useAuthStore();

  // Mobile state management
  const [isMobile, setIsMobile] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter state - using same structure as Home
  const [filters, setFilters] = useState<FilterState>({
    statuses: [],
    operators: [],
    dcTypes: [],
    tierLevels: [],
    yearRange: [2000, 2030],
    itLoadRange: [0, 1000],
    cities: [],
    countries: [],
    regions: [],
  });

  // Applied filters - only updated when Apply button is clicked
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    statuses: [],
    operators: [],
    dcTypes: [],
    tierLevels: [],
    yearRange: [2000, 2030],
    itLoadRange: [0, 1000],
    cities: [],
    countries: [],
    regions: [],
  });

  const [searchValue, setSearchValue] = useState("");
  const [appliedSearchValue, setAppliedSearchValue] = useState("");

  // Export state
  const [isExporting, setIsExporting] = useState(false);

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

  const handleApplyFilters = () => {
    // Apply current filters and search value
    setAppliedFilters(filters);
    setAppliedSearchValue(searchValue);
    if (isMobile) {
      setIsFilterOpen(false); // Close mobile filter after applying
    }
  };

  const handleClearFilters = () => {
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
    setSearchValue("");
    // Also clear applied filters immediately when clearing
    setAppliedFilters(clearedFilters);
    setAppliedSearchValue("");
    if (isMobile) {
      setIsFilterOpen(false); // Close mobile filter after clearing
    }
  };

  // Handle IT Load export
  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Convert current filters to IT Load format first, then to export format
      const itLoadFilters = convertFilterStateToITLoadFilters(
        appliedFilters,
        appliedSearchValue
      );
      const exportFilters = convertITLoadFiltersToExport(itLoadFilters);

      // Make export API call
      const blob = await exportITLoad({
        format: "excel",
        limit: 100, // Export top 100 rows as per backend default
        filters: exportFilters,
      });

      // Generate filename and download
      const filename = generateExportFilename("itload", "excel");
      downloadBlob(blob, filename);
    } catch (error) {
      console.error("Export failed:", error);
      // You could add a toast notification here
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Filter Sidebar */}
      {!isMobile && (
        <FilterSidebar
          filters={filters}
          onFiltersChange={setFilters}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          isMobile={false}
          onClose={() => setIsFilterOpen(false)}
        />
      )}

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
            <FilterSidebar
              filters={filters}
              onFiltersChange={setFilters}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              isMobile={true}
              onClose={() => setIsFilterOpen(false)}
            />
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-2 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-md lg:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:mb-2">
                <Server className="w-5 h-5 lg:w-6 lg:h-6" />
                IT Load
              </h1>
              <p className="text-gray-600 text-xs lg:text-sm pr-4 hidden sm:block">
                Track and analyze IT load capacity across facilities over time.
                Access historical trends, planned expansions, and future
                capacity forecasts to evaluate growth potential and
                infrastructure readiness.
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
                  {getActiveFiltersCount(appliedFilters) > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border border-white flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {getActiveFiltersCount(appliedFilters)}
                      </span>
                    </div>
                  )}
                </Button>
              )}

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

        {/* Data Table */}
        <div className="flex-1 overflow-auto py-2 lg:p-6">
          {/* IT Load Summary Graph */}
          <ITLoadSummaryGraph
            filters={appliedFilters}
            searchValue={appliedSearchValue}
          />

          {/* IT Load Table */}
          <ITLoadTable
            filters={appliedFilters}
            searchValue={appliedSearchValue}
          />
        </div>
      </div>
    </div>
  );
};
